function Home(){
  return(
    <>
      <div style={{textAlign: "center"}}>
        <h1> QR codeni skaner qiling! </h1>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://frontqr.vercel.app/salom"/>
      </div>
    </>
  )
}

export default Home;