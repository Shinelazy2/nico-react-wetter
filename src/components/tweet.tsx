import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storeage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 15px;
`

const Column = styled.div`
  
`

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
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

const TextArea = styled.textarea`
  display: flex;
  margin: 10px 0px;
  font-size: 18px;
  background-color: brown;
  border: none;
  color: white;
  width: 454px;
  resize: none;
  border-radius: 15px;
`

const AttchFileInput = styled.input`
  display: none;
  cursor: pointer;
`

export default function Tweet({displayName, photo, tweet, userId, id}: ITweet) {
  const [isClickEditBtn, setIsCLickEdit] = useState(false)
  const [changeText, setChangeText] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const user = auth.currentUser
  const onDelete = async () => {
    const ok = confirm("Are you sture you want to delete the tweet")
    if(!ok || user?.uid !== userId) return

    if(user?.uid !== userId) return

    try {
      await deleteDoc(doc(db, "tweets", id))
      if(photo) {
        const photoRef = ref(storeage, `tweets/${user.uid}/${id}`)
        await deleteObject(photoRef)
      }

    } catch (error) {
      console.log("error!", error);
      
    }
  }

  const onEdit = () => {
    setIsCLickEdit(true)
    setChangeText(tweet)
    console.log("tweet", tweet);
    
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChangeText(e.target.value)
  }

  const onBlur = async () => {
    await updateDoc(doc(db, "tweets", id), {
      tweet: changeText
    })
    setIsCLickEdit(false)
    console.log("isClickEditBtn", isClickEditBtn); 
  }

  useEffect(() => {
    const test = async () => {
      console.log("test");
      if(file) {
        console.log("file2", file);
        
        const locationRef = ref(storeage, `tweets/${user?.uid}/${id}`)
        const result = await uploadBytes(locationRef, file)
        const url = await getDownloadURL(result.ref)
        console.log("url", url);
        
        await updateDoc(doc(db, "tweets", id), {
          photo: url
        })
      }
    }
    test()
    setFile(null)
    
  },[file])

  const onFileChange2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("oneFIleChange");
    
    // const ok = confirm("파일 수정할꺼임?")
    // if(!ok) return

    const { files } = e.target
    
    if(files && files[0].size > 1000000) {
      confirm('파일이 1MB 이상입니다. 1MB보다 작은 용량으로 업로드해주세요.');
      throw new Error('파일 용량이 1MB보다 큼')
    }
    
    if(files && files.length === 1) {
      setFile(files[0])
    }
  }

 
  return (
    <Wrapper>
      <Column>
      <Username>{displayName}</Username>
      
      { isClickEditBtn ? 
      <TextArea rows={3} onBlur={onBlur} onChange={onChange} value={changeText}></TextArea> : 
      <Payload>{tweet}</Payload>
      }
      
      { user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
      <EditButton onClick={onEdit}>EDIT</EditButton>
      </Column>
      {photo ? 
      <Column>
      <div>
        <label htmlFor="file3" >
          <Photo  src={photo}></Photo>
          <AttchFileInput onChange={onFileChange2} id='file3' type='file' accept="image/*"></AttchFileInput>
        </label>

        {/* <Photo onChange={onFileChange}  id='file' type='image' src={photo} accept="image/*" /> */}
      </div>
      </Column> : null}
    </Wrapper>
  )
}
