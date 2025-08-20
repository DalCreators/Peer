import { useState, useEffect, useRef } from 'react'
import Peer from 'peerjs'
import { useAuth } from '../contexts/AuthContext'
import { io } from 'socket.io-client'

function VoiceChat({ roomId }) {
  
  if (error) {
    return (
      <div className="voice-chat-container">
        <div className="voice-chat-error">
          <span>Voice chat error: {error}</span>
          <button onClick={() => setError(null)} className="btn-secondary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="voice-chat-container">
      {/* Local video display */}
      {isVideoEnabled && (
        <div className="local-video-container" style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '200px',
              height: '150px',
              objectFit: 'cover',
              border: '2px solid #2196F3'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            You {isMuted ? '🔇' : (isSpeaking ? '🔊' : '🎤')}
          </div>
        </div>
      )}

      <div className="voice-chat-controls">
        {!isConnected ? (
          <div className="join-controls">
            <label className="video-option">
              <input
                type="checkbox"
                checked={isVideoEnabled}
                onChange={(e) => setIsVideoEnabled(e.target.checked)}
                disabled={isJoining}
              />
              📹 Join with video
            </label>
            <button 
              onClick={joinVoiceChat} 
              disabled={isJoining}
              className="btn-primary voice-join-btn"
              title={isVideoEnabled ? "Join video call" : "Join voice chat"}
            >
              {isJoining ? '🔄 Joining...' : (isVideoEnabled ? '📹 Join Video' : '🎤 Join Voice')}
            </button>
          </div>
        ) : (
          <div className="voice-active-controls">
            <button 
              onClick={toggleMute}
              className={`voice-control-btn ${isMuted ? 'muted' : 'unmuted'} ${isSpeaking ? 'speaking' : ''}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>

            <button 
              onClick={toggleVideo}
              className={`voice-control-btn ${isVideoEnabled ? 'video-on' : 'video-off'}`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? '📹' : '📷'}
            </button>
            
            <div className="voice-participants">
              <span className="participant-count">
                👥 {participants.length + 1} in call
              </span>
              <span className="connection-status" style={{
                fontSize: '0.8rem',
                color: connectionStatus === 'connected' ? '#28a745' : 
                       connectionStatus === 'connecting' ? '#ffc107' : '#dc3545',
                marginLeft: '8px'
              }}>
                {connectionStatus === 'connected' ? '🟢' : 
                 connectionStatus === 'connecting' ? '🟡' : '🔴'}
              </span>
            </div>
            
            <button 
              onClick={leaveVoiceChat}
              className="btn-danger voice-leave-btn"
              title="Leave call"
            >
              📞 Leave
            </button>
          </div>
        )}
      </div>

      {participants.length > 0 && (
        <div className="voice-participants-list">
          <div className={`participant-indicator ${isSpeaking ? 'speaking' : ''}`}>
            <span className="participant-name">You</span>
            <span className="participant-status">
              {isMuted ? '🔇' : (isSpeaking ? '🔊' : '🎤')}
            </span>
          </div>
          {participants.map(participant => (
            <div key={participant.peerId} className="participant-indicator">
              <span className="participant-name">{participant.userName}</span>
              <span className="participant-status">🎤</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VoiceChat