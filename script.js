// Video storage using localStorage
const STORAGE_KEY = 'uploadedVideos';

// Get references to DOM elements
const uploadArea = document.getElementById('uploadArea');
const videoInput = document.getElementById('videoInput');
const videoGallery = document.getElementById('videoGallery');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Click to upload
    uploadArea.addEventListener('click', () => {
        videoInput.click();
    });

    // File input change
    videoInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
    
    // Note: localStorage has a size limit (typically 5-10MB). 
    // For production use, consider using IndexedDB for larger files.
    
    Array.from(files).forEach(file => {
        if (validVideoTypes.includes(file.type)) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const videoData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    data: e.target.result,
                    uploadDate: new Date().toISOString()
                };
                
                saveVideo(videoData);
                addVideoToGallery(videoData);
            };
            
            reader.readAsDataURL(file);
        } else {
            console.warn(`File ${file.name} is not a supported video format.`);
        }
    });
    
    // Reset input
    videoInput.value = '';
}

// Save video to localStorage
function saveVideo(videoData) {
    const videos = getVideos();
    videos.push(videoData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

// Get all videos from localStorage
function getVideos() {
    const videos = localStorage.getItem(STORAGE_KEY);
    return videos ? JSON.parse(videos) : [];
}

// Load videos from storage
function loadVideos() {
    const videos = getVideos();
    
    if (videos.length === 0) {
        videoGallery.innerHTML = '<p class="empty-state">No videos uploaded yet</p>';
    } else {
        videoGallery.innerHTML = '';
        videos.forEach(video => addVideoToGallery(video));
    }
}

// Add video to gallery
function addVideoToGallery(videoData) {
    // Remove empty state if it exists
    const emptyState = videoGallery.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.dataset.id = videoData.id;
    
    const uploadDate = new Date(videoData.uploadDate);
    const formattedDate = uploadDate.toLocaleDateString();
    
    videoCard.innerHTML = `
        <video src="${videoData.data}" controls></video>
        <div class="video-info">
            <h3 title="${videoData.name}">${videoData.name}</h3>
            <div class="video-meta">
                <span>${videoData.size}</span>
                <span>${formattedDate}</span>
            </div>
            <div class="video-actions">
                <button class="btn btn-play" data-action="play">Play</button>
                <button class="btn btn-delete" data-action="delete">Delete</button>
            </div>
        </div>
    `;
    
    // Add event listeners for buttons
    const playBtn = videoCard.querySelector('[data-action="play"]');
    const deleteBtn = videoCard.querySelector('[data-action="delete"]');
    
    playBtn.addEventListener('click', () => playVideo(videoData.id));
    deleteBtn.addEventListener('click', () => deleteVideo(videoData.id));
    
    videoGallery.appendChild(videoCard);
}

// Play video (scroll to and play)
function playVideo(id) {
    const videoCard = document.querySelector(`[data-id="${id}"]`);
    if (videoCard) {
        const video = videoCard.querySelector('video');
        videoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            video.play();
        }, 500);
    }
}

// Delete video
function deleteVideo(id) {
    if (confirm('Are you sure you want to delete this video?')) {
        // Remove from storage
        let videos = getVideos();
        videos = videos.filter(v => v.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
        
        // Remove from DOM
        const videoCard = document.querySelector(`[data-id="${id}"]`);
        if (videoCard) {
            videoCard.remove();
        }
        
        // Check if gallery is empty
        if (videos.length === 0) {
            videoGallery.innerHTML = '<p class="empty-state">No videos uploaded yet</p>';
        }
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
