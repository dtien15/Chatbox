// Khởi tạo dữ liệu câu hỏi
let questionsData = {};
let previousState = null;
let backButtonShown = false;

// Tải dữ liệu từ tệp JSON
async function loadData() {
  try {
    const response = await fetch('data.json');
    questionsData = await response.json();
    displayOptions();
    
    // Đảm bảo chatBox bắt đầu ở trạng thái ẩn
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = 'none';

    // Hiển thị chatBox sau 3 giây
    setTimeout(() => {
      chatBox.style.display = 'flex'; // Hiển thị chatBox
      appendMessage('ai', 'Chào bạn! Hãy chọn câu hỏi và SixOs sẽ nhanh chóng giải đáp cho bạn!', 'img/1.jpg');
    }, 3000); // Hiển thị sau 3 giây

    // Kiểm tra xem có trạng thái trước đó không
    if (localStorage.getItem('chatState')) {
      previousState = JSON.parse(localStorage.getItem('chatState'));
      restoreChatState(previousState);
    }

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
  }
}

// Chuyển đổi hiển thị hộp chat (nếu cần dùng lại)
function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
}

// Hiển thị danh sách câu hỏi
function displayOptions() {
  const chatOptions = document.getElementById('chatOptions');
  chatOptions.innerHTML = '';

  questionsData.questions.forEach(question => {
    const button = createButton(question.question, () => handleQuestion(question));
    chatOptions.appendChild(button);
  });

  hideBackButton();
}

// Xử lý khi người dùng chọn một câu hỏi
function handleQuestion(question) {
  appendMessage('user', question.question, 'img/profile.png');
  appendMessage('ai', question.response, 'img/1.jpg');

  if (question.options?.length > 0) {
    showOptions(question.options);
  }

  if (!backButtonShown) {
    const backButton = createButton('Xóa tin nhắn', goBack, 'back-button');
    document.getElementById('chatBox').appendChild(backButton);
    backButtonShown = true;
  }

  scrollToBottom('chatMessages');

  // Lưu trạng thái cuộc trò chuyện vào localStorage
  saveChatState();
}

// Hiển thị các tùy chọn cho câu hỏi
function showOptions(options) {
  const chatOptions = document.getElementById('chatOptions');
  chatOptions.innerHTML = '';

  options.forEach(option => {
    const button = createButton(option.option, () => handleOption(option));
    chatOptions.appendChild(button);
  });
}

// Xử lý lựa chọn của người dùng
function handleOption(option) {
  appendMessage('user', option.option, 'img/profile.png');

  if (option.link) {
    // Hiển thị thông báo và tự động mở liên kết
    appendMessage('ai', 'Đang chuyển hướng đến trang web...', 'img/1.jpg');
    setTimeout(() => {
      window.location.href = option.link; // Tự động chuyển hướng đến liên kết
    }, 1000); // Đợi 1 giây trước khi chuyển hướng
  } else if (option.file) {
    appendMessage('ai', `Bạn có thể tải tài liệu tại: ${option.file}`, 'img/1.jpg');
    setTimeout(() => window.location.href = option.file, 1500);
  } else if (option.featureDetails) {
    appendMessage('ai', option.featureDetails, 'img/1.jpg', true);
  }

  scrollToBottom('chatMessages');

  // Lưu trạng thái cuộc trò chuyện vào localStorage
  saveChatState();
}

// Quay lại danh sách câu hỏi
function goBack() {
  const chatMessages = document.getElementById('chatMessages');

  // Xóa hết tất cả tin nhắn hiện tại (tin nhắn của người dùng và AI)
  chatMessages.innerHTML = '';

  // Hiển thị lại lời chào sau khi quay lại
  setTimeout(() => {
    appendMessage('ai', 'Chào bạn! Hãy chọn câu hỏi và SixOs sẽ nhanh chóng giải đáp cho bạn!', 'img/1.jpg');
  }, 500); // Hiển thị lời chào sau 500ms (để tránh hiển thị quá nhanh)

  // Hiển thị lại danh sách câu hỏi
  displayOptions();
  backButtonShown = false;

  // Lưu trạng thái cuộc trò chuyện vào localStorage
  saveChatState();
}

// Tạo nút bấm
function createButton(text, onClick, className = '') {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.onclick = onClick;
  return button;
}

// Tạo tin nhắn
function appendMessage(type, text, iconSrc, isHTML = false) {
  const chatMessages = document.getElementById('chatMessages');
  const message = document.createElement('div');
  message.className = `message ${type}`;

  if (iconSrc) {
    const icon = document.createElement('img');
    icon.src = iconSrc;
    icon.alt = type === 'user' ? 'Người dùng' : 'AI';
    message.appendChild(icon);
  }

  const content = document.createElement('span');
  if (isHTML) {
    content.innerHTML = text;
  } else {
    content.innerHTML = text;
  }
  message.appendChild(content);

  chatMessages.appendChild(message);
}

// Thêm liên kết vào hộp chat
function appendLink(link) {
  const chatMessages = document.getElementById('chatMessages');
  const linkElement = document.createElement('a');
  linkElement.href = link;
  linkElement.textContent = link;
  linkElement.target = '_self';

  const linkMessage = document.createElement('div');
  linkMessage.className = 'message ai';
  linkMessage.appendChild(linkElement);
  chatMessages.appendChild(linkMessage);
}

// Cuộn xuống cuối hộp tin nhắn
function scrollToBottom(elementId) {
  const element = document.getElementById(elementId);
  element.scrollTop = element.scrollHeight;
}

// Ẩn nút "Quay lại"
function hideBackButton() {
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.remove();
  }
}

// Lưu trạng thái cuộc trò chuyện vào localStorage
function saveChatState() {
  const chatMessages = document.getElementById('chatMessages');
  previousState = {
    chatMessages: chatMessages.innerHTML,
  };
  localStorage.setItem('chatState', JSON.stringify(previousState));
}

// Phục hồi trạng thái cuộc trò chuyện từ localStorage
function restoreChatState(state) {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = state.chatMessages;

  // Nếu có các câu hỏi đã chọn, tiếp tục hiển thị chúng
  displayOptions();
}

// Khởi tạo dữ liệu
loadData();
