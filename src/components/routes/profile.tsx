import styled from "styled-components"
import { auth, db, storeage } from "../../firebase"
import React, { useEffect, useState } from "react"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { ITweet } from "../timeline"
import Tweet from "../tweet"

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 60px;
  }
`
const AvatarImg = styled.img`
  width: 100%;
`
const AvatarInput = styled.input`
  display: none;
`
const Name = styled.span`
  font-size: 22px;
`

const NameInput = styled.input`
  font-size: 22px;
`

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`

const HeaderInfo = styled.span`
  display: flex;
  gap: 10px;
`

const EditButton = styled.button`
  background-color: brown;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`

export default function Profile() {
  const user = auth.currentUser
  console.log("user,atuth", user);
  
  const [ avatar, setAvatar ] = useState(user?.photoURL)
  const [ tweets, setTweets] = useState<ITweet[]>([])
  const [ displayName, setDisplayName] = useState("")
  const [ isClickEditBtn, setIsClickEditBtn] = useState(false)
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if(files && files.length === 1){
      if(!user) return
      const file = files[0]
      const locationRef = ref(storeage, `avatars/${user?.uid}`)
        const result = await uploadBytes(locationRef, file)
        const avatarUrl = await getDownloadURL(result.ref)
        setAvatar(avatarUrl)
        await updateProfile(user, {
          photoURL: avatarUrl
      })
    } 
  }

  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    )

    const snapShot = await getDocs(tweetQuery)
    const tweets = snapShot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo, displayName } = doc.data()
      setDisplayName(displayName ?? "Anonymous")
      return {
        tweet, createdAt, userId, username, photo, id: doc.id, displayName
      }
    })
    setTweets(tweets)
  }

  const changeDisplayName = async () => {
    //
    if(user?.uid === null || user?.uid === undefined) {
      throw Error("DisplayName not")
    }

    const selectQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
    )

    const users = await getDocs(selectQuery)
    
    for await (const docs of users.docs) {
      await updateDoc(doc(db, "tweets", `${docs.id}`), {
        displayName: displayName
      })
    }
    

    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    )

    const snapShot = await getDocs(tweetQuery)
    const tweets = snapShot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo, displayName } = doc.data()
      return {
        tweet, createdAt, userId, username, photo, id: doc.id, displayName
      }
    })
    setTweets(tweets)
    setIsClickEditBtn(false)
  }

  const clickEditBtn = () => {
    setIsClickEditBtn(true)
  }

  useEffect(()=> {
    fetchTweets()
  }, [])

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        { avatar ? (<AvatarImg src={avatar} />) : 
          <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        }
        
      </AvatarUpload>
      <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*"></AvatarInput>
      <HeaderInfo>
        {
          !isClickEditBtn ? 
          <Name>{displayName}</Name> : 
          <NameInput onBlur={changeDisplayName} onChange={e => setDisplayName(e.target.value)} defaultValue={displayName}></NameInput>
        }
        
        
        <EditButton onClick={clickEditBtn}>EDIT</EditButton>
      </HeaderInfo>
      <Tweets>
        {tweets.map(tweet => <Tweet key={tweet.id} {...tweet} />)}        
      </Tweets>
    </Wrapper>  
  )
}