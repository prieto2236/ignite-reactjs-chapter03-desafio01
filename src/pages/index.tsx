import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { useCallback } from 'react';
import { useState } from 'react';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = useCallback(async () => {
    try {
      await fetch(nextPage)
        .then(response => response.json())
        .then(data => {
          const postsData = data.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: post.first_publication_date,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          });

          const newPosts = posts.concat(postsData);

          setPosts(newPosts);
          setNextPage(data.nextPage);
        });
    } catch (err) {
      console.log(err);
    }
  }, [posts, nextPage]);

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postInfo}>
                  <div className={styles.postInfoContent}>
                    <FiCalendar size={15} />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy'
                      ).toLocaleLowerCase()}
                    </time>
                  </div>

                  <div className={styles.postInfoContent}>
                    <FiUser size={15} />
                    <div>{post.data.author}</div>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <div className={styles.buttonLoadingMoreContainer}>
              <button type="button" onClick={handleLoadMorePosts}>
                Carregar mais posts
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
  };
};