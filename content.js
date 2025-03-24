(function() {
  // Функция для определения цвета фона по статусу файла
  function getStatusColor(status) {
    if (status === 'Progress') return 'lightyellow';
    if (status === 'Done') return 'lightgreen';
    return '';
  }
  
  // Глобальные переменные для работы с файлами
  let allFiles = [];
  let fileListMap = {}; // имя файла => элемент <li>
  let currentFileName = null;
  let selectedFileLi = null;
  
  // Обновление счетчиков файлов по статусам в панели фильтров
  function updateStatusCounts() {
    let countToDo = 0, countProgress = 0, countDone = 0;
    allFiles.forEach(file => {
      let status = localStorage.getItem("fileStatus_" + file.name) || "ToDo";
      if (status === "ToDo") countToDo++;
      if (status === "Progress") countProgress++;
      if (status === "Done") countDone++;
    });
    document.getElementById('countToDo').textContent = countToDo;
    document.getElementById('countProgress').textContent = countProgress;
    document.getElementById('countDone').textContent = countDone;
  }
  
  // Рендеринг списка файлов с учетом выбранных фильтров и поискового запроса
  function renderFileList() {
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = '';
    fileListMap = {};

    // Get sorting option
    const sortOption = document.getElementById('sortFiles').value;
  
    // Состояния чекбоксов фильтров
    const showToDo = document.getElementById('filterToDo').checked;
    const showProgress = document.getElementById('filterProgress').checked;
    const showDone = document.getElementById('filterDone').checked;
    
    // Get search query
    const searchQuery = document.getElementById('fileSearchInput')?.value.toLowerCase() || '';

    // Apply sorting
    let sortedFiles = [...allFiles];
    switch(sortOption) {
      case 'dateDesc':
        sortedFiles.sort((a, b) => b.lastModified - a.lastModified);
        break;
      case 'dateAsc':
        sortedFiles.sort((a, b) => a.lastModified - b.lastModified);
        break;
      case 'nameAsc':
      default:
        sortedFiles.sort((a, b) => {
          const aPath = a.webkitRelativePath || a.name;
          const bPath = b.webkitRelativePath || b.name;
          return aPath.localeCompare(bPath);
        });
        break;
    }
  
    sortedFiles.forEach((file, index) => {
      let status = localStorage.getItem("fileStatus_" + file.name) || "ToDo";
      let showFile = false;
      if (status === "ToDo" && showToDo) showFile = true;
      if (status === "Progress" && showProgress) showFile = true;
      if (status === "Done" && showDone) showFile = true;
      
      // Apply search filter
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery)) {
        showFile = false;
      }
      
      if (showFile) {
        const li = document.createElement('li');
        li.textContent = (index + 1) + '. ' + file.name;
        li.style.cursor = 'pointer';
        li.style.padding = '4px';
        li.style.borderBottom = '1px solid #eee';
        li.dataset.filename = file.name;
        li.style.backgroundColor = getStatusColor(status);
  
        li.addEventListener('click', () => {
          // Снимаем выделение с предыдущего выбранного файла
          if (selectedFileLi) {
            selectedFileLi.style.outline = '';
          }
          // Выделяем текущий файл синей рамкой
          li.style.outline = '2px solid blue';
          selectedFileLi = li;
  
          // Если открыт оверлей для комментариев, закрываем его
          const existingOverlay = document.getElementById("commentOverlay");
          if (existingOverlay) {
            existingOverlay.remove();
          }
          // Загружаем PDF в iframe
          const objectUrl = URL.createObjectURL(file);
          document.getElementById('pdfFrame').src = objectUrl;
          currentFileName = file.name;
          // Устанавливаем выбранный статус в селекторе
          const status = localStorage.getItem("fileStatus_" + file.name) || "ToDo";
          document.getElementById('fileStatusSelect').value = status;
          // Обновляем стиль кнопки комментариев
          const storedComment = localStorage.getItem("fileComment_" + file.name) || '';
          if (storedComment.trim().length > 0) {
            document.getElementById('commentButton').style.backgroundColor = '#28a745';
          } else {
            document.getElementById('commentButton').style.backgroundColor = '#6c757d';
          }
        });
        fileListElement.appendChild(li);
        fileListMap[file.name] = li;
      }
    });
  }
  
  // Функция, которая создаёт и инжектирует сайдбар со всем функционалом
  function createSidebar() {
    const sidebarWidthDefault = 500; // Начальная ширина сайдбара в пикселях
    const sidebar = document.createElement('div');
    sidebar.id = 'leftSidebar';
    Object.assign(sidebar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: sidebarWidthDefault + 'px',
      height: '100%',
      backgroundColor: '#f9f9f9',
      borderRight: '1px solid #ccc',
      overflow: 'auto',
      zIndex: '10000',
      padding: '10px',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif'
    });
  
    // Разметка сайдбара с добавленным полем поиска над списком файлов
    sidebar.innerHTML = `
      <h2 style="margin-top:0; font-size:16px;">Folder & PDF Viewer</h2>
      <div style="display: flex; justify-content: space-between; margin-bottom:10px; font-size:14px;">
        <div id="statusFilters">
          <label style="margin-right: 10px;">
            <input type="checkbox" id="filterToDo" checked> ToDo (<span id="countToDo">0</span>)
          </label>
          <label style="margin-right: 10px;">
            <input type="checkbox" id="filterProgress" checked> Progress (<span id="countProgress">0</span>)
          </label>
          <label style="margin-right: 10px;">
            <input type="checkbox" id="filterDone" checked> Done (<span id="countDone">0</span>)
          </label>
        </div>
        <div>
          <label for="sortFiles">Sort: </label>
          <select id="sortFiles" style="padding: 2px; border-radius: 3px;">
            <option value="nameAsc">Name</option>
            <option value="dateDesc">Date DESC</option>
            <option value="dateAsc">Date ASC</option>
          </select>
        </div>
      </div>
      <input type="file" id="folderInput" webkitdirectory multiple style="margin-bottom:10px; width:100%;">
      <div id="sidebarContainer" style="display: flex; height: calc(100% - 160px); border: 1px solid #ccc;">
        <div style="flex: 0 0 40%; display: flex; flex-direction: column; border-right: 1px solid #ccc;">
          <div style="padding: 5px;">
            <input type="text" id="fileSearchInput" placeholder="Search files..." style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 5px;">
          </div>
          <ul id="fileList" style="list-style: none; padding: 5px; margin: 0; overflow-y: auto; flex: 1;"></ul>
        </div>
        <div id="pdfContainer" style="flex: 1; display: flex; flex-direction: column; position: relative;">
          <iframe id="pdfFrame" style="flex: 1; border: none;"></iframe>
          <div id="controlsContainer" style="display: flex; flex-direction: row; gap: 10px; margin-top: 10px;">
            <button id="summaryButtonUnderPDF" style="flex: 1; padding: 10px; background-color: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
              Summarize (RU)
            </button>
            <button id="emailButton" style="flex: 1; padding: 10px; background-color: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
              Письмо
            </button>
            <button id="commentButton" style="flex: 1; padding: 10px; background-color: #6c757d; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
              ...
            </button>
            <select id="fileStatusSelect" style="flex: 1; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
              <option value="ToDo">ToDo</option>
              <option value="Progress">Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);
    // Сдвигаем основной контент ChatGPT вправо, чтобы сайдбар его не перекрывал
    document.body.style.marginLeft = sidebarWidthDefault + 'px';
  
    // Создаем разделитель для изменения размера сайдбара
    const divider = document.createElement('div');
    divider.id = 'sidebarDivider';
    const dividerWidth = 5;
    Object.assign(divider.style, {
      position: 'fixed',
      top: '0',
      left: sidebarWidthDefault + 'px',
      width: dividerWidth + 'px',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.2)',
      cursor: 'ew-resize',
      zIndex: '10001'
    });
    document.body.appendChild(divider);
  
    let isResizing = false;
    let dragOverlay = null;
    divider.addEventListener('mousedown', (e) => {
      isResizing = true;
      dragOverlay = document.createElement('div');
      Object.assign(dragOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        cursor: 'ew-resize',
        zIndex: '10002'
      });
      document.body.appendChild(dragOverlay);
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      const minWidth = 200;
      const maxWidth = 1600;
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      sidebar.style.width = newWidth + 'px';
      divider.style.left = newWidth + 'px';
      document.body.style.marginLeft = newWidth + 'px';
    });
    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        if (dragOverlay) {
          dragOverlay.remove();
          dragOverlay = null;
        }
      }
    });
  
    // Обработка выбора файлов
    const folderInput = document.getElementById('folderInput');
    folderInput.addEventListener('change', function(event) {
      const files = event.target.files;
      allFiles = Array.from(files).filter(file =>
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      ).sort((a, b) => {
        const aPath = a.webkitRelativePath || a.name;
        const bPath = b.webkitRelativePath || b.name;
        return aPath.localeCompare(bPath);
      });
      currentFileName = null;
      selectedFileLi = null;
      updateStatusCounts();
      renderFileList();
    });
  
    // Add event listener for search input
    const fileSearchInput = document.getElementById('fileSearchInput');
    fileSearchInput.addEventListener('input', () => {
      renderFileList();
    });
  
    // Обработчики изменения фильтров
    document.getElementById('filterToDo').addEventListener('change', renderFileList);
    document.getElementById('filterProgress').addEventListener('change', renderFileList);
    document.getElementById('filterDone').addEventListener('change', renderFileList);
  
    // Обработчик изменения статуса через селектор
    document.getElementById('fileStatusSelect').addEventListener('change', () => {
      if (currentFileName) {
        const newStatus = document.getElementById('fileStatusSelect').value;
        localStorage.setItem("fileStatus_" + currentFileName, newStatus);
        updateStatusCounts();
        renderFileList();
      }
    });
  
    // Кнопка "Summarize (RU)"
    document.getElementById('summaryButtonUnderPDF').addEventListener('click', () => {
      const presetText = "Дай краткое саммари на русском языке. В конце напиши необходимые действия, если есть.";
      const promptInput = document.getElementById('prompt-textarea');
      if (promptInput) {
        promptInput.innerText = presetText;
        promptInput.focus();
        const range = document.createRange();
        range.selectNodeContents(promptInput);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  
    // Кнопка "Письмо"
    document.getElementById('emailButton').addEventListener('click', () => {
      const emailText = "Составь Email на немецком в котором напишем, что <я оплатил и чтобы они подтвердили, что у меня нет других задолженностей>. В теме и тексте письма должна быть информация из письма - дата и данные для идентификации дела. И дай адрес для отсылки.";
      const promptInput = document.getElementById('prompt-textarea');
      if (promptInput) {
        promptInput.innerText = emailText;
        promptInput.focus();
        const range = document.createRange();
        range.selectNodeContents(promptInput);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  
    // Кнопка "..." для комментариев
    document.getElementById('commentButton').addEventListener('click', () => {
      if (!currentFileName) return;
      if (document.getElementById("commentOverlay")) return;
      const commentOverlay = document.createElement('div');
      commentOverlay.id = 'commentOverlay';
      Object.assign(commentOverlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: '10003',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxSizing: 'border-box'
      });
  
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Закрыть';
      Object.assign(closeButton.style, {
        alignSelf: 'flex-end',
        padding: '5px 10px',
        marginBottom: '10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      });
      closeButton.addEventListener('click', () => {
        commentOverlay.remove();
      });
      commentOverlay.appendChild(closeButton);
  
      const commentTextarea = document.createElement('textarea');
      commentTextarea.id = 'commentTextarea';
      commentTextarea.style.flex = '1';
      commentTextarea.style.width = '100%';
      commentTextarea.style.padding = '10px';
      commentTextarea.style.fontSize = '16px';
      commentTextarea.style.boxSizing = 'border-box';
      commentTextarea.value = localStorage.getItem("fileComment_" + currentFileName) || '';
      commentTextarea.addEventListener('input', () => {
        const newComment = commentTextarea.value;
        localStorage.setItem("fileComment_" + currentFileName, newComment);
        if (newComment.trim().length > 0) {
          document.getElementById('commentButton').style.backgroundColor = '#28a745';
        } else {
          document.getElementById('commentButton').style.backgroundColor = '#6c757d';
        }
      });
      commentOverlay.appendChild(commentTextarea);
  
      document.getElementById('pdfContainer').appendChild(commentOverlay);
    });

    // Add event listener for the sorting dropdown
    document.getElementById('sortFiles').addEventListener('change', renderFileList);
  }
  
  // Функция переключения видимости сайдбара (и разделителя)
  function toggleSidebar() {
    const sidebar = document.getElementById('leftSidebar');
    const divider = document.getElementById('sidebarDivider');
    if (sidebar) {
      if (sidebar.style.display === 'none' || sidebar.style.display === '') {
        sidebar.style.display = 'block';
        if (divider) divider.style.display = 'block';
        document.body.style.marginLeft = sidebar.offsetWidth + 'px';
      } else {
        sidebar.style.display = 'none';
        if (divider) divider.style.display = 'none';
        document.body.style.marginLeft = '0';
      }
    } else {
      createSidebar();
    }
  }
  
  // Слушатель сообщений от background‑скрипта (например, при клике на иконку расширения)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleSidebar") {
      toggleSidebar();
    }
  });

  // Function to add the export button if not already present
  function addExportButtonIfNotExists() {
    const controlContainer = document.querySelector('div.flex.gap-x-1\\.5');
    if (controlContainer) {
        // Prevent duplicating the export button by checking for our unique container ID
        if (controlContainer.querySelector('#export-chat-btn-container')) {
            return;
        }
      
        // Create a container span for the export button with a unique ID
        const exportButtonSpan = document.createElement('span');
        exportButtonSpan.id = "export-chat-btn-container";
        exportButtonSpan.setAttribute('data-state', 'closed');
    
        // Create the export button element
        const exportButton = document.createElement('button');
        exportButton.className = "export-chat-btn btn relative btn-primary btn-small flex h-9 w-9 items-center justify-center rounded-full border border-token-border-light p-1 text-token-text-secondary focus-visible:outline-black dark:text-token-text-secondary dark:focus-visible:outline-white bg-transparent dark:bg-transparent can-hover:hover:bg-token-main-surface-secondary dark:can-hover:hover:bg-gray-700";
        exportButton.setAttribute('aria-label', 'Export chat');
    
        // Use an SVG icon for the export functionality
        exportButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L12 16M12 16L8 12M12 16L16 12M4 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
      
        exportButton.addEventListener('click', () => {
            let exportedText = '';
            // Получаем все сообщения в диалоге
            const articles = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
            
            articles.forEach(article => {
                // Парсинг номера сообщения
                const turnId = article.getAttribute('data-testid');
                const turnNumber = turnId ? turnId.replace('conversation-turn-', '') : '';
                
                // Определение автора сообщения по скрытому заголовку
                let authorPrefix = '';
                const userHeading = article.querySelector('h5.sr-only');
                const gptHeading = article.querySelector('h6.sr-only');
                if (userHeading && userHeading.textContent.toLowerCase().includes('you said')) {
                    authorPrefix = `${turnNumber}. USER: `;
                } else if (gptHeading && gptHeading.textContent.toLowerCase().includes('chatgpt said')) {
                    authorPrefix = `${turnNumber}. GPT: `;
                } else {
                    authorPrefix = `${turnNumber}. GPT: `;
                }
                
                // Извлечение текста сообщения
                let messageText = '';
                const userMessageElem = article.querySelector('.whitespace-pre-wrap');
                if (userMessageElem) {
                    messageText = userMessageElem.textContent.trim();
                } else {
                    // Для GPT-сообщений может быть несколько элементов с классом .markdown.prose
                    const gptMessageElems = article.querySelectorAll('.markdown.prose');
                    if (gptMessageElems.length) {
                        messageText = Array.from(gptMessageElems)
                                           .map(el => el.textContent.trim())
                                           .join("\n\n");
                    } else {
                        // Если ничего не найдено, берем всё видимое содержимое
                        messageText = article.innerText.trim();
                    }
                }
                
                if (messageText) {
                    exportedText += authorPrefix + messageText + "\n\n";
                }
            });
            
            // Копируем результат в буфер обмена
            navigator.clipboard.writeText(exportedText).then(function() {
                const hint = document.createElement('div');
                hint.textContent = "Chat copied to clipboard!";
                Object.assign(hint.style, {
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '5px',
                    zIndex: '100000'
                });
                document.body.appendChild(hint);
                setTimeout(() => { hint.remove(); }, 2000);
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        });
      
        exportButtonSpan.appendChild(exportButton);
        controlContainer.appendChild(exportButtonSpan);
    }
}
  
// Set up a MutationObserver to detect when the conversation container is added/changed.
const conversationObserver = new MutationObserver((mutations) => {
    // Check if our chat control container is present
    //Whap addExportButtonIfNotExists(); into timer to make sure the button is added after the chat is loaded
    setTimeout(addExportButtonIfNotExists, 500);
});
conversationObserver.observe(document.body, { childList: true, subtree: true });
})();
