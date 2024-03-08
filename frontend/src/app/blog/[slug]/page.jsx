import PostUser from '@/components/postUser/postUser';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import ShareButtons from '@/components/shareButtons/shareButtons';
import { alovaInstance } from '@/lib/alova';
import PostMetadata from '@/components/postMetadata/postMetadata';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import lua from 'react-syntax-highlighter/dist/cjs/languages/prism/lua';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import swift from 'react-syntax-highlighter/dist/cjs/languages/prism/swift';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import rehypeRaw from 'rehype-raw';
import path from 'path';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('lua', lua);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('yml', yaml);

// * Fetch data from API
const getPost = async (slug) => {
    const res = await alovaInstance
        .Get(`/post/${slug}`, {
            localCache: null,
        })
        .send();
    if (!res.ok) {
        throw new Error('Something went wrong');
    }
    const data = await res.json();
    return data;
};

// * Fetch data from local JSON
const DATA_ATTRS_DIR = path.join(process.cwd(), 'data', 'blog');
const DATA_ATTRS_FILE = path.join(DATA_ATTRS_DIR, 'blogs.json');
const DATA_CONTENTS_DIR = path.join(DATA_ATTRS_DIR, 'contents');

// const getPost = async (slug) => {
//     try {
//         // Read post data from JSON file
//         const postsData = await fs.readFile(
//             path.join(DATA_ATTRS_FILE),
//             'utf-8'
//         );
//         const posts = JSON.parse(postsData);
//         const post = posts.find((post) => post.slug === slug);
//         const content = await fs.readFile(
//             path.join(DATA_CONTENTS_DIR, `${slug}.md`),
//             'utf-8'
//         );
//         post.content = content;
//         return post;
//     } catch (error) {
//         console.error('Error fetching post:', error);
//         throw new Error('Failed to fetch post');
//     }
// };

const SinglePostContent = ({ post }) => {
    const createdAtText = new Date(post.created_at).toLocaleDateString(
        'en-US',
        {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }
    );

    return (
        <>
            <div
                className={`relative flex content-center items-center justify-center pt-12`}
            >
                <div
                    className="absolute top-0 w-full bg-cover bg-center bg-no-repeat h-[400px] pb-10"
                    style={{ backgroundImage: `url(${post.thumbnail})` }}
                >
                    <span
                        id="blackOverlay"
                        className="absolute h-full w-full bg-black opacity-75"
                    ></span>
                </div>
                <div className="relative flex items-center justify-center pb-4 pt-8">
                    <div className="py-16 text-center">
                        <div className="mx-auto px-4">
                            <div className="mx-auto max-w-5xl text-center">
                                <h1 className="text-2xl font-normal uppercase leading-[1.5] tracking-[3px] text-white dark:text-primary-title sm:text-xl md:text-[30px] md:tracking-[4px] lg:!leading-relaxed">
                                    {post.title}
                                </h1>
                            </div>
                            <div className="date-wrap mx-auto max-w-5xl text-center">
                                <p className="mt-6 text-[12px] font-thin uppercase tracking-[2px] text-white dark:text-primary-title">
                                    {createdAtText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 pt-10">
                <div className="-mx-4 flex flex-wrap justify-center pt-12">
                    <div className="w-full px-4 lg:w-8/12">
                        <div>
                            <div className="flex flex-wrap items-center justify-between ">
                                <PostMetadata post={post} />
                                <div className="mb-5">
                                    <ShareButtons />
                                </div>
                            </div>
                            <div className="mb-5 border-b border-[#e9e9e9] pb-[20px] text-justify text-lg font-light italic text-primary dark:border-white dark:border-opacity-10">
                                {post.description}
                            </div>
                            <div>
                                <div className="rich-content mb-8">
                                    <Markdown
                                        rehypePlugins={[rehypeRaw]}
                                        children={post.content}
                                        components={{
                                            code(props) {
                                                const {
                                                    children,
                                                    className,
                                                    node,
                                                    ...rest
                                                } = props;
                                                const match =
                                                    /language-(\w+)/.exec(
                                                        className || ''
                                                    );
                                                return match ? (
                                                    <SyntaxHighlighter
                                                        {...rest}
                                                        PreTag="div"
                                                        children={String(
                                                            children
                                                        ).replace(/\n$/, '')}
                                                        language={match[1]}
                                                        style={oneDark}
                                                    />
                                                ) : (
                                                    <code
                                                        {...rest}
                                                        className={className}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    />
                                </div>
                                <div className="items-center justify-between sm:flex">
                                    <div className="mb-5">
                                        <PostUser userId={post.user_id} />
                                    </div>
                                    <div className="mb-5">
                                        <h5 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400 sm:text-right">
                                            Share this blog :
                                        </h5>
                                        <div className="flex items-center sm:justify-end">
                                            <ShareButtons />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const SinglePostPage = async ({ params }) => {
    const { slug } = params;
    const post = await getPost(slug);

    return (
        <Suspense
            fallback={
                <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
                    <Loader2 className="mr-2 h-12 w-12 animate-spin" />
                </div>
            }
        >
            <SinglePostContent post={post} />
        </Suspense>
    );
};

export default SinglePostPage;
