import React, { useState, useRef } from 'react';

export function PodcastStarter() {
  const [podCastPlaying, setPodCastPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [p1Speaking, setP1Speaking] = useState(false);
  const [p2Speaking, setP2Speaking] = useState(false);
  const [conversations, setConversations] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartPodcastPlaying = () => {
    setPodCastPlaying(true);
    alert(`Starting podcast`);
  };

  const addConversation = (message) => {
    setConversations((prev) => [...prev, { id: Date.now(), text: message }]);
  };

  const handleStartPodcastStop = () => {
    setPodCastPlaying(false);
    if (recording) {
      handleStopRecording();
    }
  };

  const sendAudioToAPI = async (audioBlob) => {
    const url = "https://api.sarvam.ai/speech-to-text-translate";
    const formData = new FormData();
  
    formData.append('model', 'saaras:v1');
    formData.append('prompt', '');
    formData.append('language_code', 'hi-IN');
    formData.append('with_timesteps', false);
    

    const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
    formData.append('file', audioFile);
  
    // Add required headers
    const headers = {
      'api-subscription-key': 'ENTER_YOUR_API_KEY',
    };
  
    try {
      // Send the POST request with FormData
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData, // FormData automatically handles file uploads
      });
  
      if (response.ok) {
        const data = await response.json();
        addConversation(`${data.transcript}`);

        console.log('API Response:', data);
      } else {
        console.error('Failed to send audio file:', response.statusText);
      }
    } catch (error) {
      console.error('Error while sending audio file:', error);
    }
  };
  

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = []; // Reset audio chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecording(false);

        // Send the audio file to the API
        await sendAudioToAPI(audioBlob);

        // For playback and download (optional)
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      alert('Recording started for P1');
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Microphone access is required to start recording.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      alert('Recording stopped');
    }
  };

  const handleP1Speaking = () => {
    if(!p1Speaking) {
        setP1Speaking(true);
        handleStartRecording();
    } else {
        handleStopRecording();
        setP1Speaking(false);
    }
    
  };

  const handleP2Speaking = () => {
    if(!p2Speaking) {
        setP2Speaking(true);
        handleStartRecording();
    } else {
        setP2Speaking(false);
        handleStopRecording();
    }
    
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Start a Podcast</h1>
      <div>
        {!podCastPlaying &&
        <button onClick={handleStartPodcastPlaying} style={styles.button}>
          Start Podcast
        </button>
        }
        {
         podCastPlaying &&    
         <button onClick={handleStartPodcastStop} style={styles.button}>
          End Podcast
        </button>
        }
        
      </div>
      {podCastPlaying && (
        <div style={styles.buttons}>
            {!p1Speaking && 
                <button onClick={handleP1Speaking} style={styles.button}>
                    Speak P1
                </button>
            }
            {p1Speaking && 
                <button onClick={handleP1Speaking} style={styles.buttonRed}>
                    P1 speaking
                </button>
            }
            {!p2Speaking && 
                <button onClick={handleP2Speaking} style={styles.button}>
                    Speak P2
                </button>
            }
            {p2Speaking && 
                <button onClick={handleP2Speaking} style={styles.buttonRed}>
                    P2 speaking
                </button>
            }
        </div>
      )}
      <div style={styles.conversationContainer}>
        <h2 style={styles.subheading}>Conversations</h2>
        <div style={styles.scrollable}>
          {conversations.map((conversation) => (
            <div key={conversation.id} style={styles.conversationItem}>
              {conversation.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  buttons: {
    flexDirection: 'row',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f4f8',
    padding: '20px',
    boxSizing: 'border-box',
  },
  heading: {
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: '15px',
    width: '100%',
    maxWidth: '300px',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    margin: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonRed: {
    margin: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'red',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  recording: {
    marginTop: '20px',
    textAlign: 'center',
  },
  conversationContainer: {
    width: '100%',
    maxWidth: '400px',
    marginTop: '20px',
  },
  subheading: {
    fontSize: '18px',
    marginBottom: '10px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollable: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    padding: '10px',
  },
  conversationItem: {
    padding: '8px',
    marginBottom: '5px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

export default PodcastStarter;
