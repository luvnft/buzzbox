import { ArrowPathIcon, TrashIcon ,PencilSquareIcon, ArrowDownIcon, ArrowUpIcon, ChatBubbleLeftEllipsisIcon, ShareIcon } from "@heroicons/react/24/outline"
import Avatar from "./Avatar"
import TimeAgo from "react-timeago"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import {  GET_ALL_POSTS, GET_ALL_VOTES_BY_POST_ID } from "../graphql/queries" 
import {  ADD_VOTE, DELETE_COMMENTS, DELETE_POST, DELETE_VOTES, MAKE_REPOST } from "../graphql/mutation" 
import { useRouter } from 'next/router'
import { FacebookIcon, RedditIcon, TwitterIcon, WhatsappIcon, FacebookShareButton, RedditShareButton, TwitterShareButton, WhatsappShareButton, } from "react-share";


type Props = {
    post: Post
}




function Post({post}: Props) {

    let router= useRouter();
    const { data: session} = useSession();
    
    // hook for determining if user voted and custom share Modal
    const [vote, setVote] = useState<Boolean>();
    const [openShare, setOpenShare] = useState<Boolean>(false);

    const { data } = useQuery(GET_ALL_VOTES_BY_POST_ID, {
        variables: {
            post_id: post?.id
        }
    })

    /**
     * logic to add vote and then refetching the post with updated value
     */

    const [addVote] = useMutation(ADD_VOTE, {
        refetchQueries: [GET_ALL_VOTES_BY_POST_ID, 'getVoteById']
    })

    const upVote = async (isUpVote: boolean) =>{
        if(!session){
            toast.error("Sign in to vote!");
        }

        if(vote && isUpVote) return;
        if(vote === false && !isUpVote) return;

        console.log("voting...", isUpVote);

        await addVote({
            variables: {
                post_id: post.id,
                username: session?.user?.name,
                upvote: isUpVote
            }
        })
    }

    /**
     * logic which fetches votes linked to list
     * getting sum votes where true is +1 and false us -1 to resulted number
     */
    const displayVotes = (data: any) => {
        const votes: Vote[] = data?.getVoteById
        const displayNumber = votes?.reduce((total, vote)=> vote.upvote ? total += 1 : total=-1, 0)
        if(votes?.length===0) return 0;

        if(displayNumber===0){
            return votes[0]?.upvote ? 1 : -1;
        }

        return displayNumber;
    }

    /**
     * before deleting post, function queries all votes and comments linked to post
     * if exists then deletes the votes and comments before deleting post
     */
    const [deleteComment] = useMutation(DELETE_COMMENTS);

    const [deleteVote] = useMutation(DELETE_VOTES);

    const [deletePost] = useMutation(DELETE_POST, {
        refetchQueries: [
            GET_ALL_POSTS,
            'postList'
        ]
    })


    const removePost = async (postId: number) => {
        const notification = toast.loading("Deleting Post..");

        // variables to check comments and votes
        const CommentExist = post.comment.length > 0;
        const VoteExist = displayVotes(data)!==0;

        // block checking if comments linked to post exist
        if(CommentExist){
            
            // deleting linked comments
            await deleteComment({
                variables: {
                    post_id: post?.id
                }
            })
        }

        // block checking if votes linked to post exist
        if(VoteExist){
            
            // deleting linked votes
            await deleteVote({
                variables: {
                    post_id: post?.id
                }
            })    
        }

        await deletePost({
            variables: {
                id: postId
            }
        })

        
        toast.success("Post Deleted!", {
            id: notification
        })

        //push back to homepage after deleting post
        router.push("/")

    }

    const [repost] = useMutation(MAKE_REPOST, {
        refetchQueries: [
            GET_ALL_POSTS,
            'postList'
        ],
       
    });

    // same logic as addPost but with modification on username, repost and reposted_from
    const reposted = async () => {
        const notification = toast.loading("Reposting Post..");
        await repost({
            variables: {
                body: post.body,
                image: post.image,
                discussion_id: post.discussion.id,
                title: post.title,
                username: session?.user?.name,
                repost: true,
                reposted_from: post.username
            }
        })
        toast.success("Repost Sucessful!", {
            id: notification
        })

        //push back to homepage after reposting post
        router.push("/")
        
    }

    const promotion = {
        url : `https://meme.hahz.live/post/${post?.id}`,
        title: `Check out my post on this awesome site --> ${post?.title}`
    }

    useEffect(()=>{
        const votes: Vote[] = data?.getVoteById
        const vote = votes?.find(
            vote => vote.username == session?.user?.name
        )?.upvote
       
        setVote(vote);
    },[data])

  return (
    
<div className="flex pb-2 mb-2 border border-gray-600 rounded-md shadow-sm cursor-pointer bg-zinc-900 hover:border hover:border-gray-300">
        <div className="flex flex-col items-center justify-start p-4 space-y-1 text-gray-400 rounded-l-md bg-zinc-900">
            <ArrowUpIcon onClick={()=>upVote(true)}  className={`voteButtons h-6 hover:text-red-400 ${vote && `text-red-400 scale-110 font-extrabold`}`}/>
            <p className="text-xl font-bold text-white">{displayVotes(data)}</p>
            <ArrowDownIcon onClick={()=>upVote(false)} className={`voteButtons hover:text-blue-400 ${vote === false && 'text-blue-400 scale-110 font-extrabold'} `}/>
        </div>
        <div className="w-full p-3 pb-1">
        <Link href={`/post/${post?.id}`}>
            {post?.repost && <p className="flex my-auto mb-2 text-xs text-center text-gray-400 ">
                <ArrowPathIcon className="w-3 h-3 mr-1"/>
                <span className="my-auto">Reposted from {post?.reposted_from}</span>
                </p>}
            {/* Header */}
            <div className="flex items-center space-x-2">
            <Avatar seed={post?.discussion.topic} />
            <p className="text-xs text-gray-400">
                <Link href={`/space/${post?.discussion.topic}`}>
                <span className="font-bold text-white hover:text-blue-400 hover:underline">s/{post?.discussion.topic}</span>
                </Link>
                • Posted by u/{post.username} • <TimeAgo  date={post?.created_at} />
            </p>
            </div>
            {/* Body */}
            <div className="py-4">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="mt-2 text-sm font-light">{post.body}</p>
            </div>
            {/* Image */}
            {
                post.image !== '' &&(
                <img src={post?.image}  className="relative w-full"/>
                )
            }
            </Link>
            
            {/* Footer */}
            <div className="flex mt-3 space-x-4 text-gray-400 justify-evenly ">
            <Link href={`/post/${post?.id}`}>
                <div className="postButtons hover:text-red-400">
                    <ChatBubbleLeftEllipsisIcon  className="w-6 h-6 "/>
                    <p className="">{post.comment?.length}</p>
                </div>
            </Link>
               

                <button onClick={()=>reposted()} disabled={!session}  className={`postButtons ${session && 'hover:text-green-400'}`}>
                    <ArrowPathIcon  className="w-6 h-6"/>
                    <p className="hidden sm:inline">Repost</p>
                </button>

                
                
            {openShare ? (
                <div className="sticky flex items-center px-3 py-1 space-x-3 bg-neutral-800 rounded-xl">
                    <FacebookShareButton url={"popcorn.com"} quote={promotion.title}>
                        <FacebookIcon className="shareButtons" round />
                    </FacebookShareButton>
                    
                    <RedditShareButton url={promotion.url} title={promotion.title} windowWidth={660} windowHeight={460}>
                        <RedditIcon className="shareButtons" round />
                    </RedditShareButton>
                    
                    <TwitterShareButton url={promotion.url} title={promotion.title}>
                        <TwitterIcon className="shareButtons" round />
                    </TwitterShareButton>
                    
                    <WhatsappShareButton url={promotion.url} title={promotion.title} separator=":: ">
                        <WhatsappIcon className="shareButtons" round />
                    </WhatsappShareButton>
                </div>
            ) : (
                <div onClick={()=>setOpenShare(true)} className="postButtons hover:text-white">
                    <ShareIcon  className="w-6 h-6 "/>
                    <p className="hidden sm:inline">Share</p>
                </div>
            )}
                

                {session && session?.user?.name === post?.username && (
                    <div  className="flex justify-around px-4 space-x-10 bg-neutral-800 rounded-xl">
                       <Link href={`/edit/${post?.id}`}>
                            <div className={`postButtons ${session && session?.user?.name === post?.username && 'hover:text-blue-400'}`}>
                                <PencilSquareIcon  className="w-6 h-6"/>
                                <p className="hidden sm:inline">Edit</p>
                            </div>
                        </Link>

                        
                        <div onClick={()=>removePost(post?.id)} className={`postButtons ${session && session?.user?.name === post?.username && 'hover:text-red-700'}`}>
                            <TrashIcon className={`h-6 w-6 `}/>
                            <p className="hidden sm:inline">Delete</p>
                        </div> 
                </div>
                )}                
                

                              
            </div>
        </div>
    </div>
    
    
  )
}
export default Post