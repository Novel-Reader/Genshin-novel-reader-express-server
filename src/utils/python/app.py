import jieba
import re
from collections import Counter
from urllib.request import urlopen
from io import StringIO
import gzip
import sys

def analyze_word_frequency(text, top_n=10):
    """
    分析文本的词频并返回 Top N关键词
    :param text: 待分析的文本内容
    :param top_n: 返回的关键词数量，默认10
    :return: 包含关键词和词频的字典列表
    """
    cleaned_text = re.sub(r'[^\w\s]', '', text)  # 保留汉字、字母、数字和空格
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()  # 合并多个空格为一个

    words = jieba.cut(cleaned_text)

    with open('./src/utils/python/cn_stopwords.txt', encoding='utf-8') as f:
        stopwords = set(line.strip() for line in f if line.strip())
    filtered_words = [word for word in words if word.strip() and word not in stopwords and len(word) > 1]

    word_counts = Counter(filtered_words)
    top_words = word_counts.most_common(top_n)

    return ','.join([word for word, count in top_words])
    
if __name__ == "__main__":
    result = analyze_word_frequency(sys.argv[1], int(sys.argv[2]))
    # 这里先把结果打印出来，然后 python.stdout.on 获取数据，这个不是函数，所以不能直接 return data
    print(result)
