
import sys
import pymysql
import json
from makeRepository import *
# import credentials


conn = pymysql.connect(
    host='localhost',
    user=sys.argv[2],
    passwd=sys.argv[3],
    db='jurisprudencia_2_inst',
    autocommit=True
)
cur = conn.cursor()
# cur = credentials.conn()


# word = input("insert a query here:  ")

def resolveQuery(query):
    # print(query)
    wordsOnQuery = query.split()

    sql = """
    SELECT postingList, termFrequency ,docFrequency, term FROM vocabulary
    WHERE term REGEXP (%s)

    """
    ranking = []
    regex = ""

    for word in wordsOnQuery:
        regex += "(?:^|\W)" + word + "(?:$|\W)|"
    regex = regex[:len(regex)-1]
    cur.execute(sql, (regex))

    postingLists = []

    # term = {key:{"postingList":[],"term":self.list[key],"docFrequency":1}}
    term = {}
    for response in cur:
        postingLists.append(set(json.loads(response[0])))
        term[response[3]] = {"tf": json.loads(response[1]), "idf": response[2]}
        # print(response)

    postingLists.sort(key=len)
    # print(postingLists)

    docList = set.intersection(*postingLists)
    if len(docList) == 0:
        # docList = postingLists[0]
        return "No documents found"

    # print((docList))
    docsTF_IDF = {}
    for doc in docList:
        tf_idf = 0
        for word in wordsOnQuery:
            # print(f"{doc}")
            tf_idf += float(term[f"{word}"]["tf"]
                            [f"{doc}"])*float(term[word]["idf"])
        docsTF_IDF[doc] = tf_idf
    rankedDocs = sorted(docsTF_IDF, key=docsTF_IDF .__getitem__, reverse=True)
    print(json.dumps(rankedDocs))
    sys.stdout.flush()


# resolveQuery(word)
# print(sys.argv[1])
resolveQuery(sys.argv[1])


cur.close()
conn.close()
