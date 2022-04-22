library(dplyr)
library(magrittr)
library(tibble)
library(tidytext)
library(tm)
library(topicmodels)
library(tsne)

ranks <- readr::read_csv('../data/bestWorstData.csv')

df <- tibble::tibble(
  filename = ranks$filename,
  text = paste(ranks$title, ranks$subhead, ranks$overview, ranks$methodology)
)

file_words <- df %>%
  tidytext::unnest_tokens(word, text) %>%
  dplyr::anti_join(tidytext::stop_words) %>%
  dplyr::filter(!word %in% c('bloomberg', 'ranked', 'based', 'countries', "u.s."), 
                !stringr::str_detect(word, "^\\d*$")) %>%
  dplyr::count(filename, word, sort = T)

total_words <- file_words %>%
  dplyr::group_by(filename) %>%
  dplyr::summarise(total = sum(n))

file_words <- dplyr::left_join(file_words, total_words)

file_tf_idf <- file_words %>%
  tidytext::bind_tf_idf(word, filename, n)

file_dtm <- file_words %>%
  tidytext::cast_dtm(filename, word, n)

file_lda <- topicmodels::LDA(file_dtm, k = 3, control = list(seed = 1234))

file_topics <- tidytext::tidy(file_lda, matrix = "beta")

file_topics_30 <- file_topics %>%
  dplyr::group_by(topic) %>%
  dplyr::top_n(30, beta)

file_documents <- tidytext::tidy(file_lda, matrix = 'gamma')

file_documents_topic <- file_documents %>%
  dplyr::group_by(document) %>%
  dplyr::top_n(1, gamma)

file_sparse <- file_words %>%
  tidytext::cast_sparse(filename, word, n)

file_pca <- prcomp(file_sparse, scale. = T)
set.seed(4321); file_tsne <- tsne::tsne(file_pca$x)

visual_files <- tibble::tibble(
  filename = rownames(file_pca$x), 
  x = file_tsne[,1],
  y = file_tsne[,2]
) %>%
  dplyr::left_join(ranks)
#neither default TSNE nor PCA HELP

file_g <- file_tf_idf %>% 
  dplyr::filter(tf_idf > .1) %>%
  tidytext::cast_sparse(filename, word, n) %>%
  igraph::graph_from_incidence_matrix()

file_g_proj <- igraph::bipartite_projection(file_g)
cleand_file_file <- file_g_proj$proj1 %>% 
  {. - igraph::E(.)[igraph::E(.)$weight == 1]} %>%
  {. - igraph::V(.)[igraph::ego_size(.) <= 1]} %>%
  {
    set.seed(4321);
    lo <- igraph::layout_nicely(.)
    igraph::V(.)$x <- lo[,1]
    igraph::V(.)$y <- lo[,2]
    .
  }

plot(cleand_file_file, vertex.label = "", vertex.size = 1)

components_file_file <- igraph::components(cleand_file_file)

components_family_size <- vapply(components_file_file$membership, function(x){components_file_file$csize[x]}, numeric(1))

igraph::V(cleand_file_file)$component <- components_file_file$membership
igraph::V(cleand_file_file)$class <- paste(components_file_file$membership, components_family_size, sep = "_") 

edge_list <- igraph::as_data_frame(cleand_file_file)
node_list <- igraph::as_data_frame(cleand_file_file, 'vertices')

large_component <- cleand_file_file %>%
  {. - igraph::V(.)[igraph::V(.)$component != 2]}

rw_component <- igraph::cluster_walktrap(large_component)

igraph::V(large_component)$walktrap_group <- igraph::membership(rw_component)

large_component_node_list <- igraph::as_data_frame(large_component, 'vertices')

updated_node_list <- node_list %>%
  dplyr::left_join(large_component_node_list) %>%
  dplyr::rename(filename = name, x_network = x, y_network = y) %>%
  dplyr::left_join(ranks) %>%
  dplyr::mutate(updated = lubridate::mdy(updated))%>%
  dplyr::arrange(updated) %>%
  dplyr::mutate(month = lubridate::month(updated),
                year = lubridate::year(updated),
                day = lubridate::day(updated),
                monthYear = updated %>% 
                  {paste(lubridate::month(.), lubridate::year(.), sep = '-')}) %>%
  dplyr::group_by(monthYear) %>%
  tidyr::nest() %>%
  dplyr::mutate(data = purrr::map(data, function(dta){
    dta$timeRow = ifelse(1:nrow(dta) %% 2 == 1, 1, 2)
    dta$timeCol = ceiling(1:nrow(dta) /2)
    dta$timeStack = 1:nrow(dta)
    return(dta)
  })) %>%
  tidyr::unnest(cols = c(data))

large_component %>% plot(vertex.color = igraph::V(.)$walktrap_group, vertex.size=4, vertex.label = '')

updated_edge_list <- tibble::tibble(
  from = updated_node_list$filename,
  from_x = updated_node_list$x_network,
  from_y = updated_node_list$y_network
) %>%
  dplyr::right_join(edge_list) %>%
  dplyr::left_join(
    tibble::tibble(
      to = updated_node_list$filename,
      to_x = updated_node_list$x_network,
      to_y = updated_node_list$y_network
    )
  )

readr::write_csv(updated_node_list, '../data/node_list.csv' )
readr::write_csv(updated_edge_list, "../data/edge_list.csv")

forFrontend <- list(
  nodes = updated_node_list,
  edges = updated_edge_list
) %>%
  jsonlite::toJSON()

write(forFrontend, '../data/bestWorstNetwork.json')
write(paste0("let bestWorst = ", forFrontend), "../data/bestWorstNetwork.js")

