#https://www.bloomberg.com/graphics/best-and-worst/data/ranks.csv
#https://www.bloomberg.com/graphics/best-and-worst/data/ranks/co2-saved-by-bike-sharing-programs-us-cities.csv
library(magrittr)
library(readr)
library(stringr)

ranks = readr::read_csv('../data/ranks.csv')

parseMeta <- function(txt){
  txt[1:(which(stringr::str_detect(txt, '^###'))-1)] %>%
    readr::read_csv(col_names = F) %>%
    {
      x = as.list(.[[2]])
      names(x) <- .[[1]]
      as.data.frame(x)
    }
}

bestWorstExtraCT <- function(df_row){
  metaCols <- paste0("https://www.bloomberg.com/graphics/best-and-worst/data/ranks/", df_row$filename) %>%
    readLines() %>%
    parseMeta()
  
  cbind(df_row, metaCols)
}

bestWorstExtraCT(ranks[1,])
  
bestWorstData <- purrr::map(1:nrow(ranks), function(i){
  bestWorstExtraCT(ranks[i,])
}) %>% 
  do.call(rbind, .)

readr::write_csv(bestWorstData, '../data/bestWorstData.csv')
