import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom'

function ViewProfile(){
    let navigate = useNavigate();
    let location = useLocation();
    useEffect(() => {
        // console.log(location.state.rid);
        navigate('/profile',{state:{rid:location.state.rid}});
    }, [navigate]);

    return <div></div>;
}

export default ViewProfile;
