import React, { useState, useEffect } from 'react';

function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await window.storage.list('user:');
      if (result && result.keys) {
        const userPromises = result.keys.map(async (key) => {
          const data = await window.storage.get(key);
          return data ? JSON.parse(data.value) : null;
        });
        const loadedUsers = await Promise.all(userPromises);
        setUsers(loadedUsers.filter(u => u !== null));
      }
    } catch (error) {
      console.log('Foydalanuvchilar topilmadi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#4CAF50' }}>🏠 Bosh Sahifa</h1>
        <p style={{ color: '#666' }}>Backend'dan olingan foydalanuvchilar</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Yuklanmoqda...</p>
      ) : users.length > 0 ? (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {users.map((user, index) => (
            <div key={index} style={{
              border: '2px solid #4CAF50',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
            }}>
              {user.image && (
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <img 
                    src={user.image} 
                    alt={user.fullName}
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '3px solid #4CAF50'
                    }}
                  />
                </div>
              )}
              
              <h3 style={{ margin: '10px 0', color: '#333', textAlign: 'center' }}>{user.fullName}</h3>
              
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <p><strong>🏢 Tashkilot:</strong> {user.organization}</p>
                <p><strong>📱 Telefon:</strong> {user.phone}</p>
                <p><strong>🔐 Kod:</strong> {user.verificationCode}</p>
                
                <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #eee' }} />
                
                <p><strong>📅 Sana:</strong> {user.registrationDateTime?.date}</p>
                <p><strong>🕐 Vaqt:</strong> {user.registrationDateTime?.time}</p>
                
                <p><strong>🌐 Browser:</strong> {user.browserInfo?.browser} {user.browserInfo?.browserVersion}</p>
                <p><strong>💻 OS:</strong> {user.osInfo?.os} {user.osInfo?.osVersion}</p>
                <p><strong>📱 Device:</strong> {user.deviceInfo?.deviceType}</p>
                <p><strong>🔧 Arch:</strong> {user.deviceInfo?.architecture}</p>
              </div>

              <button
                onClick={() => {
                  console.log('To\'liq ma\'lumot:', user);
                  alert('To\'liq ma\'lumot console\'da ko\'rishingiz mumkin');
                }}
                style={{
                  marginTop: '15px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📋 To'liq ma'lumot
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#999' }}>
          Backend'da hech qanday ma'lumot yo'q
        </p>
      )}
    </div>
  );
}

export default Home;