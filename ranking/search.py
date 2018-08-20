# const sql = "SELECT * FROM jurisprudencia_2_inst WHERE 
# texto_decisao LIKE '%${req.query.text}%' LIMIT 5"


import pymysql
import json
from makeRepository import *

conn = pymysql.connect(
    host='localhost',
    user='root',
    passwd='',
    db='jurisprudencia_2_inst',
    autocommit=True
)
cur = conn.cursor()


word = input("insert a query here:  ")

def resolveQuery(query):
        wordsOnQuery = query.split()


        sql = """
        SELECT postingList, termFrequency ,docFrequency, term FROM vocabulary
        WHERE term REGEXP (%s)

        """
        ranking=[]
        regex = ""

        for word in wordsOnQuery:
            regex +="(?:^|\W)"+ word+ "(?:$|\W)|"
        regex = regex[:len(regex)-1]
        cur.execute(sql,(regex))

        postingLists = []

        # term = {key:{"postingList":[],"term":self.list[key],"docFrequency":1}}
        term={}
        for response in cur:
            postingLists.append(set(json.loads(response[0])))
            term[response[3]]={"tf":json.loads(response[1]),"idf":response[2]}
            print(response)

        postingLists.sort(key=len)
        print(postingLists)

        docList = set.intersection(*postingLists) 
        if len(docList) == 0:
            docList = postingLists[0]

        print((docList))
        best_docs = []
        for doc in docList:
            tf_idf = 0
            for worf in wordsOnQuery:
                tf_idf += float(term[word]["tf"][f"{doc}"])*float(term[word]["idf"])
            best_docs.append(tf_idf)
        print(best_docs)

resolveQuery(word)



cur.close()
conn.close()