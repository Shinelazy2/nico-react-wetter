import { addDoc, collection, updateDoc } from "firebase/firestore"
import React, { useState } from "react"
import styled from "styled-components"
import { auth, db, storeage } from "../firebase"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  &::placeholder {
    font-size: 16px;
  }

  &:focus{
    outline: none;
    border-color: #1d9bf0;
  }
`
const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px; 
  font-weight: 600;
  cursor: pointer;

`
const AttchFileInput = styled.input`
  display: none;
`
const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover{
    
  }
  &:active{
    opacity: 0.9;
  }
`
export default function PostTweetForm() {

  const [isLoading, setLoading] = useState(false)
  const [tweet, setTweet] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if(files && files[0].size > 1000000) {
      confirm('파일이 1MB 이상입니다. 1MB보다 작은 용량으로 업로드해주세요.');
      throw new Error('파일 용량이 1MB보다 큼')
    }
    
    if(files && files.length === 1) {
      setFile(files[0])
      console.log(files[0]);
      
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const user = auth.currentUser
    if(!user || isLoading || tweet === '' || tweet.length > 180) return

    try {
      setLoading(true)
      const doc = await addDoc(collection(db, 'tweets'), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || 'Anonymous',
        userId: user.uid
      })

      if(file) {
        const locationRef = ref(storeage, `tweets/${user.uid}/${doc.id}`)
        const result = await uploadBytes(locationRef, file)
        const url = await getDownloadURL(result.ref)
        await updateDoc(doc, {
          photo: url
        })
      }
      setTweet('')
      setFile(null)
    } catch (error) {
      console.log('erros', error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <TextArea rows={5}  maxLength={180} value={tweet} placeholder="What is Happening?!" onChange={onChange}></TextArea>
      <AttachFileButton htmlFor="file">{file ? "Photo added🍐" : 'Add photo'}</AttachFileButton>
      <AttchFileInput onChange={onFileChange} id='file' type='file' accept="image/*" />
      <SubmitBtn type="submit" value={isLoading ? 'Posting...' : 'Post Tweet'}/>
    </Form>
  )
}
