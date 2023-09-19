import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import React, { useState } from "react"
import styled from "styled-components"
import { auth } from "../../firebase"
import { Link, useNavigate } from "react-router-dom"
import { FirebaseError } from "firebase/app"
import { Wrapper, Title, Input, Switcher, Error, Form } from "../auth-components"
import GithubButton from "../github-btn"

const errors = {
  "auth/email-already-in-use" : "이미 메일 사용 중"
}

// export const Wrapper = styled.div`
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 420px;
//   padding: 50px 0px;
// `
// export const Title = styled.h1`
//   font-size: 42px;
// `
// export const Form = styled.form`
//   margin-top: 50px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   width: 100%;
//   margin-bottom: 10px;
// `

// export const Input = styled.input`
//   padding: 10px 20px;
//   border-radius: 50px;
//   border: none;
//   width: 100%;
//   font-size: 16px;
//   &[type="submit"] {
//     cursor: pointer;
//     &:hover{
//       opacity: 0.725;
//     }
//   }
// `

// export const Error = styled.span`
//   font-weight: 600;
//   color: tomato;
// `

// export const Switcher = styled.span`
//   margin-top: 20px;
//   a {
//     color: #1d9bf0
//   }
// `

export default function CreateAccount() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading ] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target: {name, value}} = e;

    
    if (name === "email") {
      setEmail(value)
    } 
    else if (name === "password") {
      setPassword(value)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    try {
      setIsLoading(true)
      if(isLoading || email === "" || password === "") return;
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
    } catch (error) {
      if(error instanceof FirebaseError) {
        setError(error.message)
        
      }
    } finally {
      setIsLoading(false)
    }

    console.log(name, email, password);
    
  }

  return (
    <Wrapper>
      <Title>Login into 👿</Title>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>  
        <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>  
        <Input type="submit" value={isLoading ? "Loading... " : "Login"}/>
      </Form> 
      { error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Don't have an account? <Link to='/create-account'>Create One →</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  )
}