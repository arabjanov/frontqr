import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Home(){
  const navigate = useNavigate();
  useEffect( () => {
    const time = setTimeout( () => { navigate('/salom')}, 1000 );
    return clearTimeout( time );
  }, [])

  return(
    <>
      <div style={{textAlign: "center"}}>
        <h1> QR codeni skaner qiling! </h1>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://frontqr.vercel.app/salom"/>
      </div>
    </>
  )
};

export default Home;