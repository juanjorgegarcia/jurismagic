import json
import re
from math import log1p

class Repository:
    def __init__(self):
        self.corpus = ""


        # with open('./data/raw/raw.json', 'r') as f:
        #     self.rawParagraphs = json.load(f)

        # with open("./sherlock.txt",'r') as f:
        #     f = f.read()
        # f = f.lower().replace('",;/\})({.:/?!][',"")


        self.list = []
        self.vocabulary = {}
        self.index = {}
        self.docs={}
        self.processedDoc = {}

    def processCorpus(self, corpus):
        """
        Formats all the text in the corpus

        Args:
        corpus(string): a string with the text of all documents

        Description:
            self.corpus: the text with all the documents formated
            self.list: alphabetic list of all unique words in corpus

        """
        reg=re.sub(r'[^ \s \d \w]',"",corpus.lower())
        self.corpus = reg
        corpus_splitted = reg.split()
        self.list = sorted(list(set(corpus_splitted)))



    def processDoc(self,doc):
        """
        Formats all the text in a doc
        Args:
            doc(tuple): (id of the document, texto_decisao) from mysqlDB
   
        Description:
            self.processedDoc: dict with {docId: formatedText}

        """

        self.processedDoc.update({doc[0]:re.sub(r'[^ \s \d \w]',"",doc[1].lower())})

    def saveInJSON(self, make=False):
        if make:
            self.processDoc()
            self.makeVocabulary()
            self.makeDocs()
            # self.makeIndex()
        # with open('./data/repo/docs.json', 'w') as fp:
        #     json.dump(self.docs, fp, indent=4)
        with open('./data/repo/vocab.json', 'w') as fp:
            json.dump(self.vocabulary, fp, sort_keys=True, indent=4)
        with open('./data/repo/inv_vocab.json', 'w') as fp:
            json.dump(self.inv_dict, fp, sort_keys=True, indent=4)


    def makeVocabulary(self):
        """
        Indexes de all the words in corpus

        Description:
            self.vocabulary: dict with {index: word}
            self.inv_dict: dict with {word: (index, frequency of word on corpus (IDF))}

        """
        self.vocabulary = {key:self.list[key] for key in range(len(self.list))}
        self.inv_dict = {v:[k,1] for (k,v) in self.vocabulary.items()} 
        
    
    def makeDocs(self):

        """
        Saves info of the words in texto_decisao

        Description:
            self.docs: dict with {id: [(wordID, wordFrequency(TF) )]}
            self.inv_dict: dict with {word: (index, frequency of word on corpus (IDF))}

        """

        self.docs = {}
        # print(self.inv_dict)
        for (key,value) in self.processedDoc.items():
            wordlist = {}
            docList = []
            wordsInDoc = value.split()
            for word in wordsInDoc:
                wordlist[self.inv_dict[word][0]] = (value.count(word)/len(wordsInDoc))
                # wordlist.append((self.inv_dict[word][0],(value.count(word)/len(wordsInDoc))))
                self.inv_dict[word][1]+=1
                # docList.append((key,value.count(word)))
            # self.index[self.inv_dict[word]] = docList
            self.docs[key] = wordlist
        

    # def makeIndex(self):

    #     # for (word_id,word) in self.vocabulary.items():
    #     #     self.index[word_id] = []
    #         for (doc_id,doc) in self.docs.items():
    #     #         if word in doc[0]:
    #     #             self.index[word_id].append(doc_id)

    #     self.index={word_id:[] for word_id in range(len(self.vocabulary.items()))}
    #     for (doc_id,doc) in self.docs.items():
    #         for i in doc[1]:
    #             self.index[i[0]].append((doc_id,i[1]))


    def computeIDF(self):
        """
        Computes the inverse document frequency which measures how important a term is.

        IDF(w) = log_e(total number of documents/ number of documents with word w in it)

        Description:
            self.inv_dict: dict with {word: (index, frequency of word on corpus (IDF))}

        """
        self.inv_dict = {word:(value[0],log1p(value[1]/len(self.docs))) for word,value in self.inv_dict.items()}
            
    # def serializeDocs(self):
    #     return json.dumps(self.docs)

    def calcTF_IDF(self,query):
        """
        Computes the tf-idf which measures how important a word is to a document in a corpus.
        
        F(w) = (number of times word w appears in a document)/(total number of words in the doc)
        IDF(w) = log_e(total number of documents/ number of documents with word w in it)
        
        tf-idf(w) = tf*idf

        Description:
            self.inv_dict: dict with {word: (index, frequency of word on corpus (IDF))}

        """
        wordsOnQuery = query.split()

        ranking=[]
        
        for docID in self.docs.keys():

            tfidf = 0
            for word in wordsOnQuery:
                print(docID)
                try:
                    tfidf += self.docs[docID][self.inv_dict[word][0]]*self.inv_dict[word][1]
                except:
                    tfidf+=0
            ranking.append((docID,tfidf))
        print(sorted(ranking)) 

    def saveVocab(self, make=False):
        """
        Saves vocabulary in .json format.

        Description:
            self.vocabulary: dict with {index: word}
            self.inv_dict: dict with {word: (index, frequency of word on corpus (IDF))}

        """
        with open('./data/vocab.json', 'w') as fp:
            json.dump(self.vocabulary, fp, sort_keys=True, indent=4)
        with open('./data/inv_vocab.json', 'w') as fp:
            json.dump(self.inv_dict, fp, sort_keys=True, indent=4)
                        

# if __name__ == "__main__":
#     repo = Repository()
#     repo.saveInJSON(make=True)
