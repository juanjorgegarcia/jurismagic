import pymysql
from makeRepository import *

conn = pymysql.connect(
    host='localhost',
    user='root',
    passwd='',
    db='jurisprudencia_2_inst',
    autocommit=True
)
cur = conn.cursor()

repo = Repository()

corpus=""
try:
    colName = "words"
    query = "ALTER TABLE jurisprudencia_2_inst ADD %s LONGTEXT " % (colName)
    cur.execute( query )
except:
    print("The column has already been added!")

cur.execute("SELECT id,texto_decisao FROM jurisprudencia_2_inst")



for response in cur:

    doc = [response[0],response[1]]
    # print(doc)
    if doc[1]== None:
        doc[1] = " "
    corpus += " "+ doc[1]

    repo.processDoc(doc)


# print(corpus)
repo.processCorpus(corpus)
repo.makeVocabulary()
repo.makeDocs()
repo.computeIDF()
repo.saveVocab()


cur.execute("CREATE TABLE IF NOT EXISTS vocabulary (termID INT, termFrequency LONGTEXT, docFrequency VARCHAR(255), postingList LONGTEXT, term TEXT)""")
# cur.execute("SHOW TABLES")
sql = "INSERT INTO vocabulary (termID, termFrequency, docFrequency, postingList, term) VALUES (%s,%s,%s,%s,%s)"
for key in repo.vocabulary.keys():
    val = (key,json.dumps(repo.vocabulary[key]["termFrequency"]),repo.vocabulary[key]["docFrequency"],json.dumps(repo.vocabulary[key]["postingList"]),repo.vocabulary[key]["term"])
    cur.execute(sql,(val))

print("The database have been updated with tf-idf info!")
    


# for x in cur:
#   print(x)
# running = True

# while running:
#     word = input("insert a query here:  ")
#     repo.calcTF_IDF(word)
#     run = input("press 0 to exit and 1 to continue")
#     if run == "0":
#         running = False



# print(repo.serializeDocs())

# cur.execute(sql,(,json.dumps(docs)))

cur.close()
conn.close()