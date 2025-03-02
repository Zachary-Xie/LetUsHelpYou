// Initial empty data array
let companiesData = [];

// When page is loaded
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const companyInfo = document.getElementById('company-info');
    const introVideo = document.getElementById('intro-video');
    const introVideoContainer = document.getElementById('intro-video-container');
    const mainContent = document.getElementById('main-content');
    
    // Search button click event
    searchButton.addEventListener('click', function() {
        performSearch();
    });
    
    // Enter key search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 视频加载失败处理
    introVideo.addEventListener('error', function(e) {
        console.error("Video error:", e);
        showMainContent();
    });
    
    // 添加加载事件回调
    introVideo.addEventListener('loadeddata', function() {
        console.log("Video loaded successfully");
    });
    
    // 整个视频容器点击事件 - 点击任何位置都能开始
    introVideoContainer.addEventListener('click', function() {
        showMainContent();
    });
    
    // 确保视频播放
    let playAttempt = setInterval(() => {
        introVideo.play()
        .then(() => {
            clearInterval(playAttempt);
            console.log("Video playback started");
        })
        .catch(error => {
            console.warn("Video play failed:", error);
            // 如果视频无法播放，5秒后自动跳过
            setTimeout(() => {
                if (introVideo.paused) {
                    showMainContent();
                }
            }, 5000);
        });
    }, 1000);
    
    // 视频播放结束事件
    introVideo.addEventListener('ended', function() {
        showMainContent();
    });
    
    function showMainContent() {
        // 停止视频播放
        introVideo.pause();
        
        // 淡出视频容器
        introVideoContainer.classList.add('fade-out');
        
        // 显示主内容
        mainContent.style.display = 'block';
        mainContent.classList.add('fade-in');
        
        // 完全移除视频容器
        setTimeout(() => {
            introVideoContainer.style.display = 'none';
        }, 1500);
    }
    
    // Perform search
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm === '') return;
        
        // Fuzzy matching search
        const results = companiesData.filter(company => 
            company.company_name.toLowerCase().includes(searchTerm)
        );
        
        displaySearchResults(results);
    }
    
    // Display search results
    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No matching companies found</div>';
            return;
        }
        
        if (results.length === 1) {
            // If only one result, display details directly
            displayCompanyInfo(results[0]);
            return;
        }
        
        // Multiple results, display list for user to choose
        results.forEach(company => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.textContent = company.company_name;
            resultItem.addEventListener('click', function() {
                displayCompanyInfo(company);
                searchResults.innerHTML = '';
            });
            searchResults.appendChild(resultItem);
        });
    }
    
    // Display company detailed information
    function displayCompanyInfo(company) {
        // Update company name
        document.getElementById('company-name').textContent = company.company_name;
        
        // Update metric bars and values
        updateMetricBar('positive', company.positive);
        updateMetricBar('negative', company.negative);
        updateMetricBar('factual', company.factual);
        updateMetricBar('opinion', company.opinion);
        
        // Display summary bubbles
        displaySummaries(company);
        
        // Show company info area
        companyInfo.classList.add('visible');
    }
    
    // Update metric bar
    function updateMetricBar(type, value) {
        const bar = document.getElementById(`${type}-bar`);
        const valueElement = document.getElementById(`${type}-value`);
        
        // Reset animation
        bar.style.width = '0%';
        
        // Trigger reflow
        void bar.offsetWidth;
        
        // Apply new value and animation
        setTimeout(() => {
            bar.style.width = `${value}%`;
            valueElement.textContent = `${value}%`;
        }, 50);
    }
    
    // Display summary bubbles
    function displaySummaries(company) {
        const summariesContainer = document.getElementById('summaries-container');
        summariesContainer.innerHTML = '';
        
        // Create three summary bubbles
        for (let i = 1; i <= 3; i++) {
            const summaryKey = `summary${i}`;
            if (company[summaryKey]) {
                const bubble = document.createElement('div');
                bubble.className = `summary-bubble summary-${i}`;
                bubble.textContent = company[summaryKey];
                summariesContainer.appendChild(bubble);
                
                // Apply floating animation, each bubble with different delay
                setTimeout(() => {
                    bubble.classList.add('visible');
                    bubble.style.animation = `float ${3 + i*0.5}s ease-in-out infinite`;
                }, 300 * i);
            }
        }
    }
    
    // Load CSV data from GitHub
    async function loadCSVFromGitHub() {
        try {
            // Replace with your actual GitHub raw file URL
            const csvUrl = 'https://raw.githubusercontent.com/Zachary-Xie/LetUsHelpYou/main/demo.csv';
            const response = await fetch(csvUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV: ${response.status}`);
            }
            
            const csvText = await response.text();
            return parseCSV(csvText);
        } catch (error) {
            console.error('Error loading CSV from GitHub:', error);
            // Return sample data as fallback
            return getSampleData();
        }
    }
    
    // Parse CSV text to array of objects
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        return lines.slice(1).filter(line => line.trim() !== '').map(line => {
            const values = line.split(',').map(value => value.trim());
            const company = {};
            
            headers.forEach((header, index) => {
                // Convert numeric values to numbers
                if (['positive', 'negative', 'factual', 'opinion'].includes(header)) {
                    company[header] = parseFloat(values[index]) || 0;
                } else {
                    company[header] = values[index] || '';
                }
            });
            
            return company;
        });
    }
    
    // Sample data as fallback
    function getSampleData() {
        return [
            {
                company_name: "Alibaba",
                positive: 85,
                negative: 15,
                factual: 70,
                opinion: 30,
                summary1: "As a Chinese e-commerce giant, Alibaba has excelled in innovation and digital economy development.",
                summary2: "Company culture has been controversial, with the '996' work system sparking industry-wide discussion.",
                summary3: "Alibaba's cloud computing business is growing rapidly, becoming a new growth driver."
            },
            {
                company_name: "Tencent",
                positive: 80,
                negative: 20,
                factual: 65,
                opinion: 35,
                summary1: "Tencent maintains leadership in social media and gaming, with a highly successful WeChat ecosystem.",
                summary2: "Concerns about gaming addiction and user privacy protection are major challenges facing the company.",
                summary3: "Tencent actively invests in global tech innovation companies with broad strategic deployment."
            },
            {
                company_name: "Baidu",
                positive: 65,
                negative: 35,
                factual: 75,
                opinion: 25,
                summary1: "Baidu has invested heavily in AI, making significant progress in autonomous driving technology.",
                summary2: "Search business faces intensified competition, with market share challenged by emerging platforms like TikTok.",
                summary3: "Baidu Intelligent Cloud business is developing well, with AI solutions gradually being implemented."
            },
            {
                company_name: "Huawei",
                positive: 90,
                negative: 10,
                factual: 60,
                opinion: 40,
                summary1: "Huawei's innovation capabilities in 5G technology and smartphones are globally recognized.",
                summary2: "Facing international trade restrictions, Huawei has shown strong resilience and adaptability.",
                summary3: "The release of HarmonyOS marks an important milestone in Huawei's ecosystem development."
            }
        ];
    }
    
    // Initialize data loading
    loadCSVFromGitHub().then(data => {
        if (data && data.length > 0) {
            companiesData = data;
            console.log("Data loaded successfully, loaded", data.length, "companies");
        } else {
            console.warn("No data loaded, using sample data");
            companiesData = getSampleData();
        }
    });
}); 
