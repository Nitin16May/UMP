import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function LandingPage(){
    let navigate = useNavigate();
    const [msg, setMsg] = useState('Click a Button');
    const tryGet = async (e) => {
        e.preventDefault();
        console.log(`${process.env.REACT_APP_API_URL}/tryget`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/tryget`, {
            method: 'GET'
        });
        const jsonn = await response.json();
        setMsg(jsonn.msg);
    };
    
    const tryPost = async (e) => {
        e.preventDefault();
        console.log(`${process.env.REACT_APP_API_URL}/trypost`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/trypost`, {
            method: 'POST'
        });
        const jsonn = await response.json();
        setMsg(jsonn.msg);
    };

    const login = async (e) => {
        e.preventDefault();
        navigate('/');
    }

    return (
        <div>
            <div>
                <button onClick={tryGet}>Try Get</button>
                <button onClick={tryPost}>Try Post</button>
                {msg}
            </div>
        </div>
    );
}

export default LandingPage;
