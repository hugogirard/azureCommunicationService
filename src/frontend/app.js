// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize Materialize Components
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    
    // Initialize rich text editor
    initializeEditor();
    
    // Initialize navigation
    initializeNavigation();
    
    // Load message history
    loadMessageHistory();
    
    // Setup form handler
    setupFormHandler();
    
    // Setup clear history button
    setupClearHistoryButton();
});

// Rich Text Editor
let quill;

function initializeEditor() {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: 'Compose your message...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding view
            const viewName = this.getAttribute('data-view');
            showView(viewName);
            
            // Reload history if switching to history view
            if (viewName === 'history') {
                loadMessageHistory();
            }
        });
    });
}

function showView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// Form Handler
function setupFormHandler() {
    const form = document.getElementById('email-form');
    const resetBtn = document.getElementById('reset-btn');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await sendEmail();
    });
    
    resetBtn.addEventListener('click', function() {
        quill.setContents([]);
    });
}

// Clear History Button Handler
function setupClearHistoryButton() {
    const clearBtn = document.getElementById('clear-history-btn');
    const confirmBtn = document.getElementById('confirm-clear-btn');
    const clearModal = document.getElementById('clear-confirm-modal');
    
    clearBtn.addEventListener('click', function() {
        // Open confirmation modal
        const modalInstance = M.Modal.getInstance(clearModal);
        modalInstance.open();
    });
    
    confirmBtn.addEventListener('click', function() {
        // Clear all messages from local storage
        localStorage.removeItem('emailMessages');
        
        // Reload the message history display
        loadMessageHistory();
        
        // Show success message
        M.toast({
            html: '<i class="material-icons left">delete_sweep</i>All messages cleared successfully!',
            classes: 'green',
            displayLength: 3000
        });
    });
}

// Send Email
async function sendEmail() {
    const recipientEmail = document.getElementById('recipient-email').value;
    const subject = document.getElementById('email-subject').value;
    const htmlContent = quill.root.innerHTML;
    const plainTextContent = quill.getText();
    
    // Validate form
    if (!recipientEmail || !subject || !plainTextContent.trim()) {
        M.toast({html: 'Please fill in all required fields', classes: 'red'});
        return;
    }
    
    // Show loading toast
    const loadingToast = M.toast({
        html: '<i class="material-icons left">cloud_upload</i>Sending email...',
        classes: 'blue',
        displayLength: Infinity
    });
    
    try {
        const payload = {
            recipients: {
                to: [
                    {
                        address: recipientEmail
                    }
                ]
            },
            subject: subject,
            content: {
                plainText: plainTextContent,
                html: htmlContent
            }
        };
        
        const response = await fetch(`${API_BASE_URL}/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('Failed to send email');
        }
        
        const data = await response.json();
        
        // Dismiss loading toast
        loadingToast.dismiss();
        
        // Save to local storage - store the entire messageId object/string
        saveMessageToHistory({
            messageId: data.messageId, // This could be an object or stringified JSON
            messageIdRaw: typeof data.messageId === 'string' ? data.messageId : JSON.stringify(data.messageId),
            to: recipientEmail,
            subject: subject,
            timestamp: new Date().toISOString(),
            status: 'Queued'
        });
        
        // Show success message
        M.toast({
            html: '<i class="material-icons left">check_circle</i>Email sent successfully!',
            classes: 'green'
        });
        
        // Reset form
        document.getElementById('email-form').reset();
        quill.setContents([]);
        
        // Update labels (Materialize fix)
        M.updateTextFields();
        
    } catch (error) {
        // Dismiss loading toast
        loadingToast.dismiss();
        
        console.error('Error sending email:', error);
        M.toast({
            html: '<i class="material-icons left">error</i>Failed to send email. Please try again.',
            classes: 'red'
        });
    }
}

// Local Storage for Message History
function saveMessageToHistory(message) {
    let messages = JSON.parse(localStorage.getItem('emailMessages') || '[]');
    messages.unshift(message);
    localStorage.setItem('emailMessages', JSON.stringify(messages));
}

function getMessageHistory() {
    return JSON.parse(localStorage.getItem('emailMessages') || '[]');
}

// Load and Display Message History
function loadMessageHistory() {
    const messages = getMessageHistory();
    const messagesList = document.getElementById('messages-list');
    const clearBtn = document.getElementById('clear-history-btn');
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="material-icons">mail_outline</i>
                <p>No messages sent yet</p>
            </div>
        `;
        // Hide clear button when no messages
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        return;
    }
    
    // Show clear button when there are messages
    if (clearBtn) {
        clearBtn.style.display = 'inline-flex';
    }
    
    messagesList.innerHTML = messages.map(message => {
        // Extract a readable ID for display
        const displayId = getDisplayId(message.messageId);
        const messageIdForData = message.messageIdRaw || (typeof message.messageId === 'string' ? message.messageId : JSON.stringify(message.messageId));
        
        return `
        <div class="message-item" data-message-id="${escapeHtml(messageIdForData)}">
            <div class="message-header">
                <div>
                    <div class="message-id">
                        <i class="material-icons tiny">fingerprint</i>
                        ID: ${displayId}
                        <i class="material-icons tiny copy-icon" data-copy="${escapeHtml(messageIdForData)}" data-copy-format="json" title="Copy message ID in JSON format">content_copy</i>
                    </div>
                </div>
                <div class="message-timestamp">
                    ${formatDate(message.timestamp)}
                </div>
            </div>
            <div class="message-details">
                <div class="message-to">
                    <i class="material-icons tiny">person</i>
                    To: ${message.to}
                </div>
                <div class="message-subject">
                    <i class="material-icons tiny">subject</i>
                    ${message.subject}
                </div>
            </div>
            <div class="message-status-inline">
                <span class="status-badge ${getStatusClass(message.status || 'Queued')}">${message.status || 'Queued'}</span>
                <span class="status-hint">Click to refresh status</span>
            </div>
        </div>
        `;
    }).join('');
    
    // Attach click event listeners to message items
    const messageItems = messagesList.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking on copy icon
            if (e.target.classList.contains('copy-icon')) {
                return;
            }
            const messageId = this.getAttribute('data-message-id');
            checkEmailStatus(messageId);
        });
    });
    
    // Attach copy to clipboard functionality
    const copyIcons = messagesList.querySelectorAll('.copy-icon');
    copyIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering message item click
            const textToCopy = this.getAttribute('data-copy');
            const format = this.getAttribute('data-copy-format');
            copyToClipboard(textToCopy, format === 'json');
        });
    });
}

// Check Email Status
async function checkEmailStatus(messageId) {
    const modal = M.Modal.getInstance(document.getElementById('status-modal'));
    const statusDetails = document.getElementById('status-details');
    
    // Show modal with loading state
    statusDetails.innerHTML = `
        <div class="center-align">
            <div class="preloader-wrapper small active">
                <div class="spinner-layer spinner-blue-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>
            <p>Loading status...</p>
        </div>
    `;
    modal.open();
    
    try {
        // Get the full message from local storage to get the complete messageId
        const messages = getMessageHistory();
        const message = messages.find(msg => 
            (typeof msg.messageId === 'string' && msg.messageId === messageId) ||
            (typeof msg.messageId === 'object' && JSON.stringify(msg.messageId) === messageId) ||
            msg.messageIdRaw === messageId
        );
        
        // Prepare the messageId - it should be the full object/string from the send response
        let messageIdPayload = messageId;
        if (message && message.messageIdRaw) {
            messageIdPayload = message.messageIdRaw;
        }
        
        // Use POST request with messageId in body
        const response = await fetch(`${API_BASE_URL}/email/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messageId: messageIdPayload })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch status (${response.status})`);
        }
        
        const status = await response.json();
        
        // Update status in local storage based on the response
        if (status.status) {
            updateMessageStatus(messageId, status.status);
        }
        
        // Display the raw API response with better formatting
        statusDetails.innerHTML = `
            <div class="status-container">
                <div class="status-header">
                    <i class="material-icons ${getStatusIcon(status.status)}">
                        ${getStatusIconName(status.status)}
                    </i>
                    <h5>Email Status Response</h5>
                </div>
                
                <div class="status-section">
                    <div class="status-row column">
                        <span class="status-label">
                            <i class="material-icons tiny">code</i> API Response
                        </span>
                        <div class="api-response-box">
                            <div class="response-header">
                                <span>JSON Response</span>
                                <i class="material-icons tiny copy-icon-response" data-copy="${escapeHtml(JSON.stringify(status))}" title="Copy response">content_copy</i>
                            </div>
                            <pre><code>${JSON.stringify(status, null, 2)}</code></pre>
                        </div>
                    </div>
                </div>
                
                <div class="status-section">
                    <div class="status-row">
                        <span class="status-label">
                            <i class="material-icons tiny">fingerprint</i> Operation ID
                        </span>
                        <span class="status-value monospace">${status.id || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="status-section">
                    <div class="status-row">
                        <span class="status-label">
                            <i class="material-icons tiny">info</i> Status
                        </span>
                        <span class="status-badge ${getStatusClass(status.status)}">${status.status || 'Unknown'}</span>
                    </div>
                </div>
                
                ${status.error ? `
                    <div class="status-section error">
                        <div class="status-row column">
                            <span class="status-label red-text">
                                <i class="material-icons tiny">error</i> Error
                            </span>
                            <span class="status-value red-text">${status.error}</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="status-section">
                    <div class="status-row">
                        <span class="status-label">
                            <i class="material-icons tiny">fingerprint</i> Message ID (Request)
                        </span>
                        <span class="status-value monospace">
                            ${getDisplayId(messageId)}
                            <i class="material-icons tiny copy-icon-modal" data-copy="${escapeHtml(messageIdPayload)}" data-copy-format="json" title="Copy message ID in JSON format">content_copy</i>
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        // Attach copy to clipboard functionality in modal
        const modalCopyIcon = statusDetails.querySelector('.copy-icon-modal');
        if (modalCopyIcon) {
            modalCopyIcon.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                const format = this.getAttribute('data-copy-format');
                copyToClipboard(textToCopy, format === 'json');
            });
        }
        
        // Attach copy functionality for response
        const responseCopyIcon = statusDetails.querySelector('.copy-icon-response');
        if (responseCopyIcon) {
            responseCopyIcon.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                copyToClipboard(textToCopy, false);
            });
        }
        
        // Refresh the message list to show updated status
        loadMessageHistory();
        
    } catch (error) {
        console.error('Error fetching status:', error);
        statusDetails.innerHTML = `
            <div class="red-text center-align error-state">
                <i class="material-icons large">error_outline</i>
                <h5>Failed to fetch email status</h5>
                <p>${error.message}</p>
                <p class="grey-text">Please check your connection and try again.</p>
            </div>
        `;
    }
}

// Update message status in local storage
function updateMessageStatus(messageId, newStatus) {
    let messages = getMessageHistory();
    messages = messages.map(msg => {
        if (msg.messageId === messageId) {
            msg.status = newStatus;
        }
        return msg;
    });
    localStorage.setItem('emailMessages', JSON.stringify(messages));
}

// Format status details object for display
function formatStatusDetails(details) {
    if (typeof details === 'string') {
        return `<p>${details}</p>`;
    }
    
    if (typeof details === 'object' && details !== null) {
        return Object.entries(details)
            .map(([key, value]) => `
                <div class="detail-item">
                    <strong>${key}:</strong> ${JSON.stringify(value)}
                </div>
            `)
            .join('');
    }
    
    return `<p>${details}</p>`;
}

// Get status icon name
function getStatusIconName(status) {
    if (!status) return 'schedule';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered') || statusLower.includes('sent') || statusLower.includes('succeeded')) {
        return 'check_circle';
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
        return 'error';
    } else if (statusLower.includes('queued') || statusLower.includes('out for delivery') || statusLower.includes('running')) {
        return 'schedule';
    }
    
    return 'info';
}

// Get status icon class
function getStatusIcon(status) {
    if (!status) return 'orange-text';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered') || statusLower.includes('sent') || statusLower.includes('succeeded')) {
        return 'green-text';
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
        return 'red-text';
    } else if (statusLower.includes('queued') || statusLower.includes('out for delivery') || statusLower.includes('running')) {
        return 'orange-text';
    }
    
    return 'blue-text';
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('queued') || statusLower.includes('out for delivery') || statusLower.includes('running')) {
        return 'pending';
    } else if (statusLower.includes('delivered') || statusLower.includes('sent') || statusLower.includes('succeeded')) {
        return 'sent';
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
        return 'failed';
    }
    
    return 'pending';
}

// Extract a readable ID from the messageId (which may be a complex JSON string)
function getDisplayId(messageId) {
    try {
        if (typeof messageId === 'string') {
            // Try to parse if it's JSON
            if (messageId.startsWith('{')) {
                const parsed = JSON.parse(messageId);
                // Try to extract operation location or any ID-like field
                if (parsed.state && parsed.state.config && parsed.state.config.operationLocation) {
                    const url = parsed.state.config.operationLocation;
                    const match = url.match(/operations\/([a-f0-9-]+)/i);
                    if (match) return match[1].substring(0, 20) + '...';
                }
            }
            // Just show first 20 chars
            return messageId.substring(0, 20) + '...';
        } else if (typeof messageId === 'object') {
            // If it's an object, try to extract operation ID
            if (messageId.state && messageId.state.config && messageId.state.config.operationLocation) {
                const url = messageId.state.config.operationLocation;
                const match = url.match(/operations\/([a-f0-9-]+)/i);
                if (match) return match[1].substring(0, 20) + '...';
            }
            return JSON.stringify(messageId).substring(0, 20) + '...';
        }
        return String(messageId).substring(0, 20) + '...';
    } catch (e) {
        return String(messageId).substring(0, 20) + '...';
    }
}

// Escape HTML to prevent XSS when using data attributes
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Copy text to clipboard
async function copyToClipboard(text, wrapInJson = false) {
    let textToCopy = text;
    
    // Wrap in JSON format if requested
    if (wrapInJson) {
        const jsonPayload = {
            messageId: text
        };
        textToCopy = JSON.stringify(jsonPayload, null, 2);
    }
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        M.toast({
            html: '<i class="material-icons left">check</i>Message ID copied to clipboard!',
            classes: 'green',
            displayLength: 2000
        });
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            M.toast({
                html: '<i class="material-icons left">check</i>Message ID copied to clipboard!',
                classes: 'green',
                displayLength: 2000
            });
        } catch (err2) {
            console.error('Failed to copy:', err2);
            M.toast({
                html: '<i class="material-icons left">error</i>Failed to copy to clipboard',
                classes: 'red',
                displayLength: 3000
            });
        }
        document.body.removeChild(textArea);
    }
}
