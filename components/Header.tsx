import Image from "next/image"
import {MagnifyingGlassIcon, UserIcon, ChatBubbleLeftRightIcon, ArrowRightIcon} from "@heroicons/react/24/outline"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_DISCUSSION_LIST } from "../graphql/queries";
import { useRouter } from "next/router";

function Header() {
    const {data: session} = useSession();

    /**
     * val useState is all the data fetched from query
     * searchVal is input value
     * spaces is filter result from val
     */
    const [spaces, setSpaces] = useState<Discussion[]>([])
    const [searchValue, setSearchValue] = useState<string>("");
    const [val, setVal] = useState<Discussion[]>([])
    const router = useRouter();

    const {data} = useQuery(GET_DISCUSSION_LIST);
    
    // function is executed when user clicks on search input
   const fillData = () => {
    const discussion: Discussion[] =  data?.discussionList; 
    setVal(discussion)  
   }

   //each time search value changes, spaces array is reassigned as a filtered result from val array
   useEffect(()=>{
        setSpaces(val && [...val].filter((res)=>{
            return res.topic.toLowerCase().includes(searchValue.toLowerCase())
        }))  
   },[searchValue])

  return (
    <div className="sticky top-0 z-50 grid grid-cols-3 p-4 bg-black border-b-2 border-white shadow-lg">
        {/* Header icon */}
        <div className="cursor-pointer">
            <div className="relative w-40 h-20">
                <Link href="/">
                <Image src="https://i.imgur.com/D2c16LH.png" fill className="object-contain" alt="header icon"/>
                </Link>
            </div>
        </div>

        {/* Search  */}
        <div className="z-50 my-auto">
            <form className="z-10 flex px-3 py-1 border-2 border-white rounded-lg">
                <input value={searchValue} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setSearchValue(e.target.value)} type="text" className="flex-grow bg-transparent outline-none text-md" onClick={()=>fillData()} placeholder="Search memes here.."/>
                <MagnifyingGlassIcon className="w-10 h-10 text-white cursor-pointer"/>
            </form>

            {searchValue && (
                <div className="absolute mt-5 space-y-1 z-50 lg:w-[500px] w-[240px] py-2 rounded-lg bg-white">
                 {spaces && spaces.map(res=>{
                    return(
                
                            <p key={res.id} onClick={()=>{
                                router.push(`/space/${res.topic}`)
                                setSearchValue("");
                            }} className="px-4 text-black transition duration-200 ease-in-out transform border-b-2 hover:font-bold hover:cursor-pointer last:border-b-0">
                                s/{res.topic}
                            </p>
                       
                    ) 
                    
                 })}
                </div>
            )}
        </div>
            
    
        
        {/* right section */}
        <div className="flex justify-end my-auto">
            {/* conditional rendering of div block and component based on authentication */}
            <div onClick={()=> session ? signOut() : signIn()} className='flex px-4 py-4 text-black bg-white rounded-xl'>
                <div className='pr-3 my-auto border-r-2 cursor-pointer'>
                    <p>{session ? (
                        <>
                            <p className="text-sm font-semibold">Welcome,</p>
                            <p className="text-xs font-semibold tuncate">{session?.user?.name}!</p>
                        </>
                        
                        ): "Sign In"
                        }
                    </p>
                </div>
                
                {session ? (
                    <ArrowRightIcon className='h-6 pl-3 my-auto cursor-pointer'/>
                ) : (
                    <UserIcon className='h-6 pl-3 my-auto cursor-pointer'/>
                )}
            </div>
        </div>

        
    </div>
  )
}
export default Header