import pymysql
from SearchEngine.make_repository import *

conn = pymysql.connect(
    host='localhost',
    user='root',
    passwd='',
    db='jurisprudencia_2_inst',
    autocommit=True
)
cur = conn.cursor()
cur.execute("SELECT id,texto_decisao FROM jurisprudencia_2_inst")


repo = Repository()

corpus=""
try:
    colName = "words"
    query = "ALTER TABLE jurisprudencia_2_inst ADD %s LONGTEXT " % (colName)
    cur.execute( query )
except:
    print("The column has already been added!")

for response in cur:

    doc = [response[0],response[1]]
    print(doc)
    if doc[1]== None:
        doc[1] = " "
    corpus += " "+ doc[1]

    repo.processDoc(doc)


# print(corpus)
repo.processCorpus(corpus)
repo.makeVocabulary()
repo.makeDocs()
repo.computeIDF()

sql = "UPDATE jurisprudencia_2_inst SET words = (%s) where id = (%s)"
for key,value in repo.docs.items():
    cur.execute(sql,(json.dumps(value),key))
    print("The database have been updated with tf-idf info")
    

# ae = True

# while ae:
#     word = input("insert a query here:  ")
#     repo.calcTF_IDF(word)
#     run = input("press 0 to exit and 1 to continue")
#     if run == "0":
#         ae = False



# print(repo.serializeDocs())

# cur.execute(sql,(,json.dumps(docs)))

cur.close()
conn.close()