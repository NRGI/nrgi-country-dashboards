# Notes

This is where I will store notes on the data as we go through.

## Data
1. EITI data for Ghana
 - focus on aggregate views
 - convert to CSV + data package for datacats
2. Other indicators

### Ghana EITI datasets

There are two principal datasets containing EITI data for Ghana:

#### A. EITI dataset for all countries

This contains the following dimensions:

- year (2004-2013)
- commodity (n ~= 5)
- country

Also includes production volumes.

These are combined into a single Excel file in [NRGI-data/nrgi-data-catalog/eiti/scripts](https://github.com/NRGI-data/nrgi-data-catalog/tree/master/eiti/scripts)

##### To do

1. Convert to CSV
2. Create a data package
 
#### B. GHEITI datasets for Ghana only

This contains a couple more dimensions than the global EITI dataset:

- year (2007-2013)
- commodity
- [country = Ghana]
- company
- revenue streams (GFS codes)
- receiving govt agency

These are split across several Excel spreadsheets, but helpfully combined into a single CSV file in [NRGI/eiti-parser](https://github.com/NRGI/eiti-parser).

##### To do

1. Convert to CSV [DONE ALREADY]
2. Create a data package

#### Recommendation

1. Generate data packages for both (global and Ghana)
2. Probably more interesting to display GHEITI datasets. Might limit extent to which dashboards can be generalised, but it also shows off the most interesting data and allows for more slices / dimensions to be displayed.