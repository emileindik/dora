# Databricks notebook source
# MAGIC %md # Load MAG dataset and compute h-index for all authors
# MAGIC 
# MAGIC To run this notebook:
# MAGIC   - [Create an Azure Databricks service](https://azure.microsoft.com/en-us/services/databricks/).
# MAGIC   - [Create a cluster for the Azure Databricks service](https://docs.azuredatabricks.net/user-guide/clusters/create.html).
# MAGIC   - [Import](https://docs.databricks.com/user-guide/notebooks/notebook-manage.html#import-a-notebook) samples/PySparkMagClass.py under Workspace **Shared** folder.
# MAGIC   - [Import](https://docs.databricks.com/user-guide/notebooks/notebook-manage.html#import-a-notebook) this notebook.
# MAGIC   - Replace **`<AzureStorageAccount>`**. This is the Azure Storage account containing MAG dataset.
# MAGIC   - Replace **`<AzureStorageAccessKey>`**. This is the Access Key of the Azure Storage account.
# MAGIC   - Replace **`<MagContainer>`**. This is the container name in Azure Storage account containing MAG dataset, Usually in forms of mag-yyyy-mm-dd.
# MAGIC   - Replace **`<OutputContainer>`**. This is the container name in Azure Storage account where the output goes to.
# MAGIC   - Attach this notebook to the cluster and run.

# COMMAND ----------

# MAGIC %run "/Shared/PySparkMagClass"
from PySparkMagClass import MicrosoftAcademicGraph

# COMMAND ----------

AzureStorageAccount = 'magasdora'     # Azure Storage (AS) account containing MAG dataset
AzureStorageAccessKey = '' # Access Key of the Azure Storage (AS) account
MagContainer = 'mag-2020-08-03'                   # The container name in Azure Storage (AS) account containing MAG dataset, Usually in forms of mag-yyyy-mm-dd
# @emile OutputContainer = '<OutputContainer>'             # The container name in Azure Storage (AS) account where the output goes to

# COMMAND ----------

# Create a MicrosoftAcademicGraph instance to access MAG dataset
MAG = MicrosoftAcademicGraph(container=MagContainer, account=AzureStorageAccount, key=AzureStorageAccessKey)

# Create a AzureStorageUtil instance to access other Azure Storage files
# @emile ASU = AzureStorageUtil(container=OutputContainer, account=AzureStorageAccount, key=AzureStorageAccessKey)

# COMMAND ----------

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# COMMAND ----------

# Get affiliations
Affiliations = MAG.getDataframe('Affiliations')
Affiliations = Affiliations.select(Affiliations.AffiliationId, Affiliations.DisplayName)
Affiliations.show(3)

# COMMAND ----------

# Get authors
Authors = MAG.getDataframe('Authors')
Authors = Authors.select(Authors.AuthorId, Authors.DisplayName, Authors.LastKnownAffiliationId, Authors.PaperCount)
Authors.show(3)

# COMMAND ----------

# Get (author, paper) pairs
PaperAuthorAffiliations = MAG.getDataframe('PaperAuthorAffiliations')
AuthorPaper = PaperAuthorAffiliations.select(PaperAuthorAffiliations.AuthorId, PaperAuthorAffiliations.PaperId).distinct()
AuthorPaper.show(3)

# COMMAND ----------

# Get (Paper, EstimatedCitation). Treat papers with same FamilyId as a single paper and sum the EstimatedCitation
Papers = MAG.getDataframe('Papers')

p = Papers.where(Papers.EstimatedCitation > 0) \
  .select(F.when(Papers.FamilyId.isNull(), Papers.PaperId).otherwise(Papers.FamilyId).alias('PaperId'), \
          Papers.EstimatedCitation) \
  .alias('p')

PaperCitation = p \
  .groupBy(p.PaperId) \
  .agg(F.sum(p.EstimatedCitation).alias('EstimatedCitation'))

# COMMAND ----------

# Generate author, paper, citation view
AuthorPaperCitation = AuthorPaper \
    .join(PaperCitation, AuthorPaper.PaperId == PaperCitation.PaperId, 'inner') \
    .select(AuthorPaper.AuthorId, AuthorPaper.PaperId, PaperCitation.EstimatedCitation)

# COMMAND ----------

# Order author, paper, citation view by citation
AuthorPaperOrderByCitation = AuthorPaperCitation \
  .withColumn('Rank', F.row_number().over(Window.partitionBy('AuthorId').orderBy(F.desc('EstimatedCitation'))))

# COMMAND ----------

# Generate author hindex
ap = AuthorPaperOrderByCitation.alias('ap')
AuthorHIndexTemp = ap \
  .groupBy(ap.AuthorId) \
  .agg(F.sum(ap.EstimatedCitation).alias('TotalEstimatedCitation'), \
       F.max(F.when(ap.EstimatedCitation >= ap.Rank, ap.Rank).otherwise(0)).alias('HIndex'))

# COMMAND ----------

# Get author detail information
i = AuthorHIndexTemp.alias('i')
a = Authors.alias('a')
af = Affiliations.alias('af')

AuthorHIndex = i \
  .join(a, a.AuthorId == i.AuthorId, 'inner') \
  .join(af, a.LastKnownAffiliationId == af.AffiliationId, 'outer') \
  .select(i.AuthorId, a.DisplayName, af.DisplayName.alias('AffiliationDisplayName'), a.PaperCount, i.TotalEstimatedCitation, i.HIndex)

# COMMAND ----------

TopAuthorHIndex = AuthorHIndex \
  .select(AuthorHIndex.DisplayName, AuthorHIndex.AffiliationDisplayName, AuthorHIndex.PaperCount, AuthorHIndex.TotalEstimatedCitation, AuthorHIndex.HIndex) \
  .orderBy(F.desc('HIndex')) \
  .limit(100)
display(TopAuthorHIndex)

# COMMAND ----------

# Output result
# @emile ASU.save(AuthorHIndex, 'AuthorHIndex.csv', coalesce=True)
