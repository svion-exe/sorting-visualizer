// Sorting Algorithm Visualization Lab
class SortingVisualizer {
    constructor() {
        this.canvas = document.getElementById('sortingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timelineCanvas = document.getElementById('timelineCanvas');
        this.timelineCtx = this.timelineCanvas.getContext('2d');
        
        // App state
        this.array = [];
        this.originalArray = [];
        this.arraySize = 50;
        this.currentAlgorithm = 'bubbleSort';
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.animationSpeed = 5;
        this.visualizationStyle = 'bars';
        
        // Animation state
        this.animationId = null;
        this.steps = [];
        this.stepHistory = [];
        this.comparing = [];
        this.swapping = [];
        this.sorted = [];
        this.pivot = -1;
        
        // Statistics
        this.stats = {
            comparisons: 0,
            swaps: 0,
            steps: 0,
            startTime: 0,
            timeElapsed: 0
        };
        
        // Features state
        this.soundEnabled = true;
        this.theme = 'light';
        this.mode3D = false;
        this.heatmapMode = false;
        this.aiPredictorMode = false;
        this.easterEggMode = false;
        
        // Audio context
        this.audioContext = null;
        this.initAudio();
        
        // Algorithm data
        this.algorithmData = {
            bubbleSort: {
                name: "Bubble Sort",
                timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: true,
                description: "Compares adjacent elements and swaps them if they're in wrong order"
            },
            selectionSort: {
                name: "Selection Sort",
                timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: false,
                description: "Finds minimum element and places it at the beginning"
            },
            insertionSort: {
                name: "Insertion Sort",
                timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: true,
                description: "Builds sorted array one element at a time"
            },
            mergeSort: {
                name: "Merge Sort",
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
                spaceComplexity: "O(n)",
                stable: true,
                description: "Divides array into halves, sorts them, then merges back"
            },
            quickSort: {
                name: "Quick Sort",
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
                spaceComplexity: "O(log n)",
                stable: false,
                description: "Selects pivot and partitions array around it"
            },
            heapSort: {
                name: "Heap Sort",
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
                spaceComplexity: "O(1)",
                stable: false,
                description: "Uses heap data structure to sort elements"
            },
            radixSort: {
                name: "Radix Sort",
                timeComplexity: { best: "O(nk)", average: "O(nk)", worst: "O(nk)" },
                spaceComplexity: "O(n + k)",
                stable: true,
                description: "Sorts by processing digits from least to most significant"
            },
            shellSort: {
                name: "Shell Sort",
                timeComplexity: { best: "O(n log n)", average: "O(n^1.3)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: false,
                description: "Extension of insertion sort with gap sequence"
            },
            countingSort: {
                name: "Counting Sort",
                timeComplexity: { best: "O(n + k)", average: "O(n + k)", worst: "O(n + k)" },
                spaceComplexity: "O(n + k)",
                stable: true,
                description: "Counts occurrences of each element to sort"
            }
        };
        
        // Konami code sequence
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.konamiIndex = 0;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.generateArray();
        this.setupEventListeners();
        this.updateAlgorithmInfo();
        this.updateCanvas();
        this.updateStats();
        
        // Set initial canvas size
        this.resizeCanvas();
        
        // Initialize theme
        this.theme = document.documentElement.getAttribute('data-color-scheme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.updateTheme();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio context not supported');
            this.soundEnabled = false;
        }
    }
    
    setupEventListeners() {
        // Algorithm selection
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
            this.updateAlgorithmInfo();
            this.resetAnimation();
        });
        
        // Playback controls
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAnimation());
        document.getElementById('stepForwardBtn').addEventListener('click', () => this.stepForward());
        document.getElementById('stepBackBtn').addEventListener('click', () => this.stepBackward());
        
        // Speed control
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value;
        });
        
        // Array controls
        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            document.getElementById('sizeValue').textContent = e.target.value;
            this.generateArray();
            this.resetAnimation();
        });
        
        document.getElementById('distributionSelect').addEventListener('change', () => {
            this.generateArray();
            this.resetAnimation();
        });
        
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            this.generateArray();
            this.resetAnimation();
        });
        
        // Visualization style
        document.querySelectorAll('input[name="vizStyle"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.visualizationStyle = e.target.value;
                this.updateCanvas();
            });
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Mode toggles
        document.getElementById('mode3dBtn').addEventListener('click', () => this.toggle3DMode());
        document.getElementById('heatmapBtn').addEventListener('click', () => this.toggleHeatmapMode());
        document.getElementById('raceBtn').addEventListener('click', () => this.showRaceModal());
        
        // Race mode
        document.getElementById('startRaceBtn').addEventListener('click', () => this.startRace());
        document.getElementById('exitRaceBtn').addEventListener('click', () => this.exitRace());
        
        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
        
        // Timeline
        document.getElementById('timelineToggle').addEventListener('click', () => this.toggleTimeline());
        document.getElementById('timelineCanvas').addEventListener('click', (e) => this.scrubTimeline(e));
        
        // Easter egg
        document.getElementById('closeEasterEgg').addEventListener('click', () => {
            document.getElementById('easterEgg').classList.add('hidden');
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }
    
    generateArray() {
        const distribution = document.getElementById('distributionSelect').value;
        this.array = [];
        
        switch (distribution) {
            case 'random':
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push(Math.floor(Math.random() * 300) + 10);
                }
                break;
                
            case 'nearlySorted':
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push(i * (300 / this.arraySize) + 10);
                }
                // Shuffle 10% of elements
                for (let i = 0; i < this.arraySize * 0.1; i++) {
                    const idx1 = Math.floor(Math.random() * this.arraySize);
                    const idx2 = Math.floor(Math.random() * this.arraySize);
                    [this.array[idx1], this.array[idx2]] = [this.array[idx2], this.array[idx1]];
                }
                break;
                
            case 'reverse':
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push((this.arraySize - i) * (300 / this.arraySize) + 10);
                }
                break;
                
            case 'fewUnique':
                const uniqueValues = [50, 100, 150, 200, 250];
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
                }
                break;
                
            case 'gaussian':
                for (let i = 0; i < this.arraySize; i++) {
                    let val = this.gaussianRandom() * 100 + 150;
                    val = Math.max(10, Math.min(310, val));
                    this.array.push(Math.floor(val));
                }
                break;
        }
        
        this.originalArray = [...this.array];
        this.updateCanvas();
    }
    
    gaussianRandom() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    
    updateAlgorithmInfo() {
        const algo = this.algorithmData[this.currentAlgorithm];
        document.getElementById('currentAlgorithm').textContent = algo.name;
        document.getElementById('algorithmDescription').textContent = algo.description;
        document.getElementById('bestCase').textContent = algo.timeComplexity.best;
        document.getElementById('averageCase').textContent = algo.timeComplexity.average;
        document.getElementById('worstCase').textContent = algo.timeComplexity.worst;
        document.getElementById('spaceComplexity').textContent = algo.spaceComplexity;
        
        const stableElement = document.getElementById('stable');
        stableElement.textContent = algo.stable ? 'Yes' : 'No';
        stableElement.className = `status ${algo.stable ? 'status--success' : 'status--warning'}`;
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width - 32; // Account for padding
        this.canvas.height = Math.max(400, rect.height - 32);
        
        const timelineRect = this.timelineCanvas.parentElement.getBoundingClientRect();
        this.timelineCanvas.width = timelineRect.width - 24;
        
        this.updateCanvas();
    }
    
    updateCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.array.length === 0) return;
        
        const barWidth = (this.canvas.width - 40) / this.array.length;
        const maxHeight = this.canvas.height - 40;
        const maxValue = Math.max(...this.array);
        
        for (let i = 0; i < this.array.length; i++) {
            const height = (this.array[i] / maxValue) * maxHeight;
            const x = 20 + i * barWidth;
            const y = this.canvas.height - 20 - height;
            
            // Determine color based on state
            let color = '#3B82F6'; // Normal (blue)
            if (this.sorted.includes(i)) {
                color = '#10B981'; // Sorted (green)
            } else if (this.swapping.includes(i)) {
                color = '#EF4444'; // Swapping (red)
            } else if (this.comparing.includes(i)) {
                color = '#F59E0B'; // Comparing (yellow)
            } else if (i === this.pivot) {
                color = '#8B5CF6'; // Pivot (purple)
            }
            
            this.ctx.fillStyle = color;
            
            switch (this.visualizationStyle) {
                case 'bars':
                    this.drawBar(x, y, barWidth - 2, height, this.easterEggMode ? this.getRandomEmoji() : null);
                    break;
                case 'dots':
                    this.drawDot(x + barWidth/2, y + height/2, Math.min(barWidth/3, height/6));
                    break;
                case 'shapes':
                    this.drawShape(x + barWidth/2, y + height/2, barWidth/2, height/2);
                    break;
            }
            
            // Draw value labels for small arrays
            if (this.array.length <= 20) {
                this.ctx.fillStyle = '#374151';
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.array[i], x + barWidth/2, this.canvas.height - 5);
            }
        }
        
        // Update heat map
        if (this.heatmapMode) {
            this.updateHeatmap();
        }
    }
    
    drawBar(x, y, width, height, emoji = null) {
        if (this.mode3D) {
            // Simple 3D effect
            this.ctx.fillRect(x, y, width, height);
            this.ctx.fillStyle = this.lightenColor(this.ctx.fillStyle, 0.3);
            this.ctx.fillRect(x + 3, y - 3, width, height);
        } else {
            this.ctx.fillRect(x, y, width, height);
        }
        
        if (emoji) {
            this.ctx.font = `${Math.min(width, 20)}px serif`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(emoji, x + width/2, y + height/2);
        }
    }
    
    drawDot(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawShape(x, y, width, height) {
        this.ctx.beginPath();
        // Draw diamond shape
        this.ctx.moveTo(x, y - height);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x - width, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                     (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                     (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    getRandomEmoji() {
        const emojis = ['🔥', '🍕', '🐱', '🎯', '🚀', '⭐️', '🎭', '🎪', '🌈', '💎'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    updateHeatmap() {
        const sortedness = this.calculateSortedness();
        const hue = sortedness * 120; // 0 (red) to 120 (green)
        const overlay = document.getElementById('heatmapOverlay');
        overlay.style.backgroundColor = `hsla(${hue}, 60%, 50%, 0.1)`;
    }
    
    calculateSortedness() {
        let correctlyPlaced = 0;
        for (let i = 0; i < this.array.length - 1; i++) {
            if (this.array[i] <= this.array[i + 1]) {
                correctlyPlaced++;
            }
        }
        return correctlyPlaced / (this.array.length - 1);
    }
    
    // Sorting Algorithms
    generateSteps() {
        this.steps = [];
        this.stats = { comparisons: 0, swaps: 0, steps: 0, startTime: Date.now(), timeElapsed: 0 };
        
        const arrayCopy = [...this.array];
        
        switch (this.currentAlgorithm) {
            case 'bubbleSort':
                this.bubbleSortSteps(arrayCopy);
                break;
            case 'selectionSort':
                this.selectionSortSteps(arrayCopy);
                break;
            case 'insertionSort':
                this.insertionSortSteps(arrayCopy);
                break;
            case 'mergeSort':
                this.mergeSortSteps(arrayCopy, 0, arrayCopy.length - 1);
                break;
            case 'quickSort':
                this.quickSortSteps(arrayCopy, 0, arrayCopy.length - 1);
                break;
            case 'heapSort':
                this.heapSortSteps(arrayCopy);
                break;
            case 'radixSort':
                this.radixSortSteps(arrayCopy);
                break;
            case 'shellSort':
                this.shellSortSteps(arrayCopy);
                break;
            case 'countingSort':
                this.countingSortSteps(arrayCopy);
                break;
        }
        
        this.totalSteps = this.steps.length;
    }
    
    bubbleSortSteps(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                this.steps.push({
                    type: 'compare',
                    indices: [j, j + 1],
                    array: [...arr],
                    comparisons: ++this.stats.comparisons
                });
                
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    this.steps.push({
                        type: 'swap',
                        indices: [j, j + 1],
                        array: [...arr],
                        swaps: ++this.stats.swaps
                    });
                }
            }
            this.steps.push({
                type: 'sorted',
                indices: [n - i - 1],
                array: [...arr]
            });
        }
        this.steps.push({
            type: 'sorted',
            indices: [0],
            array: [...arr]
        });
    }
    
    selectionSortSteps(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            this.steps.push({
                type: 'select',
                indices: [i],
                array: [...arr]
            });
            
            for (let j = i + 1; j < n; j++) {
                this.steps.push({
                    type: 'compare',
                    indices: [minIdx, j],
                    array: [...arr],
                    comparisons: ++this.stats.comparisons
                });
                
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                this.steps.push({
                    type: 'swap',
                    indices: [i, minIdx],
                    array: [...arr],
                    swaps: ++this.stats.swaps
                });
            }
            
            this.steps.push({
                type: 'sorted',
                indices: [i],
                array: [...arr]
            });
        }
        this.steps.push({
            type: 'sorted',
            indices: [n - 1],
            array: [...arr]
        });
    }
    
    insertionSortSteps(arr) {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
            
            this.steps.push({
                type: 'select',
                indices: [i],
                array: [...arr]
            });
            
            while (j >= 0 && arr[j] > key) {
                this.steps.push({
                    type: 'compare',
                    indices: [j, j + 1],
                    array: [...arr],
                    comparisons: ++this.stats.comparisons
                });
                
                arr[j + 1] = arr[j];
                this.steps.push({
                    type: 'shift',
                    indices: [j + 1],
                    array: [...arr]
                });
                j--;
            }
            arr[j + 1] = key;
            
            if (j + 1 !== i) {
                this.stats.swaps++;
                this.steps.push({
                    type: 'insert',
                    indices: [j + 1],
                    array: [...arr],
                    swaps: this.stats.swaps
                });
            }
        }
        
        this.steps.push({
            type: 'sorted',
            indices: Array.from({length: arr.length}, (_, i) => i),
            array: [...arr]
        });
    }
    
    mergeSortSteps(arr, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            this.mergeSortSteps(arr, left, mid);
            this.mergeSortSteps(arr, mid + 1, right);
            this.mergeSteps(arr, left, mid, right);
        }
    }
    
    mergeSteps(arr, left, mid, right) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.steps.push({
                type: 'compare',
                indices: [left + i, mid + 1 + j],
                array: [...arr],
                comparisons: ++this.stats.comparisons
            });
            
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            
            this.steps.push({
                type: 'merge',
                indices: [k],
                array: [...arr]
            });
            k++;
        }
        
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            this.steps.push({
                type: 'merge',
                indices: [k],
                array: [...arr]
            });
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            this.steps.push({
                type: 'merge',
                indices: [k],
                array: [...arr]
            });
            j++;
            k++;
        }
    }
    
    quickSortSteps(arr, low, high) {
        if (low < high) {
            const pi = this.partitionSteps(arr, low, high);
            this.quickSortSteps(arr, low, pi - 1);
            this.quickSortSteps(arr, pi + 1, high);
        }
    }
    
    partitionSteps(arr, low, high) {
        const pivot = arr[high];
        this.steps.push({
            type: 'pivot',
            indices: [high],
            array: [...arr]
        });
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            this.steps.push({
                type: 'compare',
                indices: [j, high],
                array: [...arr],
                comparisons: ++this.stats.comparisons
            });
            
            if (arr[j] <= pivot) {
                i++;
                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    this.steps.push({
                        type: 'swap',
                        indices: [i, j],
                        array: [...arr],
                        swaps: ++this.stats.swaps
                    });
                }
            }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        this.steps.push({
            type: 'swap',
            indices: [i + 1, high],
            array: [...arr],
            swaps: ++this.stats.swaps
        });
        
        return i + 1;
    }
    
    heapSortSteps(arr) {
        const n = arr.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapifySteps(arr, n, i);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            this.steps.push({
                type: 'swap',
                indices: [0, i],
                array: [...arr],
                swaps: ++this.stats.swaps
            });
            
            this.steps.push({
                type: 'sorted',
                indices: [i],
                array: [...arr]
            });
            
            this.heapifySteps(arr, i, 0);
        }
        
        this.steps.push({
            type: 'sorted',
            indices: [0],
            array: [...arr]
        });
    }
    
    heapifySteps(arr, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            this.steps.push({
                type: 'compare',
                indices: [left, largest],
                array: [...arr],
                comparisons: ++this.stats.comparisons
            });
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.steps.push({
                type: 'compare',
                indices: [right, largest],
                array: [...arr],
                comparisons: ++this.stats.comparisons
            });
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            this.steps.push({
                type: 'swap',
                indices: [i, largest],
                array: [...arr],
                swaps: ++this.stats.swaps
            });
            
            this.heapifySteps(arr, n, largest);
        }
    }
    
    radixSortSteps(arr) {
        const max = Math.max(...arr);
        
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            this.countingSortByDigitSteps(arr, exp);
        }
        
        this.steps.push({
            type: 'sorted',
            indices: Array.from({length: arr.length}, (_, i) => i),
            array: [...arr]
        });
    }
    
    countingSortByDigitSteps(arr, exp) {
        const n = arr.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        
        // Count occurrences of each digit
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(arr[i] / exp) % 10;
            count[digit]++;
            this.steps.push({
                type: 'count',
                indices: [i],
                array: [...arr]
            });
        }
        
        // Change count[i] so it contains actual position
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        // Build output array
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
            this.steps.push({
                type: 'place',
                indices: [i],
                array: [...arr]
            });
        }
        
        // Copy output array to arr
        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
            this.steps.push({
                type: 'copy',
                indices: [i],
                array: [...arr]
            });
        }
    }
    
    shellSortSteps(arr) {
        const n = arr.length;
        
        // Start with a big gap, then reduce the gap
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            this.steps.push({
                type: 'gap',
                gap: gap,
                array: [...arr]
            });
            
            for (let i = gap; i < n; i++) {
                let temp = arr[i];
                let j;
                
                this.steps.push({
                    type: 'select',
                    indices: [i],
                    array: [...arr]
                });
                
                for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                    this.steps.push({
                        type: 'compare',
                        indices: [j - gap, j],
                        array: [...arr],
                        comparisons: ++this.stats.comparisons
                    });
                    
                    arr[j] = arr[j - gap];
                    this.steps.push({
                        type: 'shift',
                        indices: [j],
                        array: [...arr]
                    });
                }
                
                arr[j] = temp;
                if (j !== i) {
                    this.stats.swaps++;
                    this.steps.push({
                        type: 'insert',
                        indices: [j],
                        array: [...arr],
                        swaps: this.stats.swaps
                    });
                }
            }
        }
        
        this.steps.push({
            type: 'sorted',
            indices: Array.from({length: arr.length}, (_, i) => i),
            array: [...arr]
        });
    }
    
    countingSortSteps(arr) {
        const max = Math.max(...arr);
        const min = Math.min(...arr);
        const range = max - min + 1;
        const count = new Array(range).fill(0);
        const output = new Array(arr.length);
        
        // Count occurrences
        for (let i = 0; i < arr.length; i++) {
            count[arr[i] - min]++;
            this.steps.push({
                type: 'count',
                indices: [i],
                array: [...arr]
            });
        }
        
        // Change count[i] so it contains actual position
        for (let i = 1; i < range; i++) {
            count[i] += count[i - 1];
        }
        
        // Build output array
        for (let i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i] - min] - 1] = arr[i];
            count[arr[i] - min]--;
            this.steps.push({
                type: 'place',
                indices: [i],
                array: [...arr]
            });
        }
        
        // Copy output array to arr
        for (let i = 0; i < arr.length; i++) {
            arr[i] = output[i];
            this.steps.push({
                type: 'copy',
                indices: [i],
                array: [...arr]
            });
        }
        
        this.steps.push({
            type: 'sorted',
            indices: Array.from({length: arr.length}, (_, i) => i),
            array: [...arr]
        });
    }
    
    // Animation control methods
    togglePlayPause() {
        if (!this.isPlaying && this.steps.length === 0) {
            this.generateSteps();
        }
        
        if (this.isPlaying) {
            this.pauseAnimation();
        } else {
            this.playAnimation();
        }
    }
    
    playAnimation() {
        this.isPlaying = true;
        this.stats.startTime = Date.now() - (this.currentStep * (1000 / this.animationSpeed));
        
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        this.animate();
    }
    
    pauseAnimation() {
        this.isPlaying = false;
        
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        if (this.currentStep < this.totalSteps) {
            const step = this.steps[this.currentStep];
            this.executeStep(step);
            this.currentStep++;
            this.stats.steps = this.currentStep;
            
            // Update AI predictor
            if (this.aiPredictorMode) {
                this.updateAIPredictor();
            }
            
            setTimeout(() => {
                this.stats.timeElapsed = (Date.now() - this.stats.startTime) / 1000;
                this.updateStats();
                this.animationId = requestAnimationFrame(() => this.animate());
            }, 1000 / this.animationSpeed);
        } else {
            this.completeAnimation();
        }
    }
    
    executeStep(step) {
        // Clear previous state
        this.comparing = [];
        this.swapping = [];
        this.pivot = -1;
        
        // Apply current step
        this.array = [...step.array];
        
        switch (step.type) {
            case 'compare':
                this.comparing = step.indices;
                break;
            case 'swap':
                this.swapping = step.indices;
                this.stats.swaps = step.swaps || this.stats.swaps;
                break;
            case 'sorted':
                step.indices.forEach(i => {
                    if (!this.sorted.includes(i)) {
                        this.sorted.push(i);
                    }
                });
                break;
            case 'pivot':
                this.pivot = step.indices[0];
                break;
            case 'select':
            case 'merge':
            case 'shift':
            case 'insert':
            case 'place':
            case 'copy':
            case 'count':
                // Visual feedback for these operations
                this.comparing = step.indices;
                break;
        }
        
        if (step.comparisons) this.stats.comparisons = step.comparisons;
        if (step.swaps) this.stats.swaps = step.swaps;
        
        // Play sound
        if (this.soundEnabled && step.indices) {
            this.playSound(step.indices[0]);
        }
        
        this.updateCanvas();
        this.updateTimeline();
    }
    
    completeAnimation() {
        this.isPlaying = false;
        this.sorted = Array.from({length: this.array.length}, (_, i) => i);
        this.comparing = [];
        this.swapping = [];
        this.pivot = -1;
        
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        this.updateCanvas();
        this.stats.timeElapsed = (Date.now() - this.stats.startTime) / 1000;
        this.updateStats();
        
        // Show completion effect
        if (!this.easterEggMode) {
            this.showCompletionEffect();
        }
    }
    
    showCompletionEffect() {
        const canvas = this.canvas;
        canvas.style.animation = 'pulse 0.5s ease-in-out 3';
        setTimeout(() => {
            canvas.style.animation = '';
        }, 1500);
    }
    
    resetAnimation() {
        this.pauseAnimation();
        this.array = [...this.originalArray];
        this.steps = [];
        this.currentStep = 0;
        this.totalSteps = 0;
        this.comparing = [];
        this.swapping = [];
        this.sorted = [];
        this.pivot = -1;
        
        this.stats = { comparisons: 0, swaps: 0, steps: 0, startTime: 0, timeElapsed: 0 };
        
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        this.updateCanvas();
        this.updateStats();
        this.updateTimeline();
    }
    
    stepForward() {
        if (!this.steps.length) {
            this.generateSteps();
        }
        
        if (this.currentStep < this.totalSteps) {
            const step = this.steps[this.currentStep];
            this.executeStep(step);
            this.currentStep++;
            this.stats.steps = this.currentStep;
            this.updateStats();
        }
        
        if (this.currentStep >= this.totalSteps) {
            this.completeAnimation();
        }
    }
    
    stepBackward() {
        if (this.currentStep > 0) {
            this.currentStep--;
            
            // Reset to previous state
            if (this.currentStep === 0) {
                this.array = [...this.originalArray];
                this.comparing = [];
                this.swapping = [];
                this.sorted = [];
                this.pivot = -1;
            } else {
                const step = this.steps[this.currentStep - 1];
                this.executeStep(step);
            }
            
            this.stats.steps = this.currentStep;
            this.updateStats();
        }
    }
    
    updateStats() {
        document.getElementById('comparisons').textContent = this.stats.comparisons;
        document.getElementById('swaps').textContent = this.stats.swaps;
        document.getElementById('steps').textContent = this.stats.steps;
        document.getElementById('timeElapsed').textContent = this.stats.timeElapsed.toFixed(1) + 's';
    }
    
    updateAIPredictor() {
        const remaining = this.totalSteps - this.currentStep;
        const confidence = Math.max(70, 95 - (this.currentStep / this.totalSteps) * 25);
        
        document.getElementById('predictedSteps').textContent = remaining;
        document.getElementById('confidence').textContent = Math.floor(confidence) + '%';
        
        if (!document.getElementById('aiPredictor').classList.contains('hidden')) {
            document.getElementById('aiPredictor').classList.remove('hidden');
        }
    }
    
    updateTimeline() {
        if (!this.timelineCanvas || this.steps.length === 0) return;
        
        this.timelineCtx.clearRect(0, 0, this.timelineCanvas.width, this.timelineCanvas.height);
        
        const stepWidth = this.timelineCanvas.width / this.totalSteps;
        const maxValue = Math.max(...this.originalArray);
        
        for (let i = 0; i < this.totalSteps; i++) {
            const step = this.steps[i];
            if (!step.array) continue;
            
            for (let j = 0; j < step.array.length; j++) {
                const height = (step.array[j] / maxValue) * this.timelineCanvas.height;
                const x = i * stepWidth;
                const y = this.timelineCanvas.height - height;
                const barWidth = stepWidth / step.array.length;
                
                this.timelineCtx.fillStyle = i <= this.currentStep ? '#10B981' : '#E5E7EB';
                this.timelineCtx.fillRect(x + j * barWidth, y, Math.max(1, barWidth), height);
            }
        }
        
        // Update marker position
        const marker = document.getElementById('timelineMarker');
        if (marker) {
            const position = (this.currentStep / this.totalSteps) * 100;
            marker.style.left = position + '%';
        }
    }
    
    scrubTimeline(e) {
        if (this.totalSteps === 0) return;
        
        const rect = this.timelineCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;
        const targetStep = Math.floor(progress * this.totalSteps);
        
        if (targetStep !== this.currentStep) {
            this.currentStep = Math.max(0, Math.min(targetStep, this.totalSteps - 1));
            
            if (this.currentStep < this.steps.length) {
                const step = this.steps[this.currentStep];
                this.executeStep(step);
            }
            
            this.stats.steps = this.currentStep;
            this.updateStats();
        }
    }
    
    toggleTimeline() {
        const timeline = document.getElementById('timeline');
        timeline.classList.toggle('hidden');
        
        const btn = document.getElementById('timelineToggle');
        const icon = btn.querySelector('i');
        icon.classList.toggle('fa-history');
        icon.classList.toggle('fa-eye-slash');
    }
    
    // Feature toggles
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.updateTheme();
    }
    
    updateTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.theme);
        
        const themeBtn = document.getElementById('themeToggle');
        const icon = themeBtn.querySelector('i');
        icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Update canvas
        setTimeout(() => this.updateCanvas(), 100);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        const soundBtn = document.getElementById('soundToggle');
        const icon = soundBtn.querySelector('i');
        icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }
    
    toggle3DMode() {
        this.mode3D = !this.mode3D;
        
        const btn = document.getElementById('mode3dBtn');
        btn.classList.toggle('active');
        
        const container = document.querySelector('.canvas-container');
        container.classList.toggle('mode-3d', this.mode3D);
        
        this.updateCanvas();
    }
    
    toggleHeatmapMode() {
        this.heatmapMode = !this.heatmapMode;
        
        const btn = document.getElementById('heatmapBtn');
        btn.classList.toggle('active');
        
        const overlay = document.getElementById('heatmapOverlay');
        overlay.classList.toggle('hidden', !this.heatmapMode);
        
        if (this.heatmapMode) {
            this.updateHeatmap();
        }
    }
    
    // Race mode
    showRaceModal() {
        document.getElementById('raceModal').classList.remove('hidden');
    }
    
    startRace() {
        const selectedAlgorithms = Array.from(document.querySelectorAll('#raceModal input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        if (selectedAlgorithms.length < 2) {
            alert('Please select at least 2 algorithms to race!');
            return;
        }
        
        document.getElementById('raceModal').classList.add('hidden');
        document.getElementById('raceView').classList.remove('hidden');
        
        // Initialize race
        this.initRace(selectedAlgorithms);
    }
    
    initRace(algorithms) {
        this.raceData = {
            algorithms: algorithms,
            states: {},
            canvases: {}
        };
        
        const raceContainer = document.querySelector('.race-lanes');
        raceContainer.innerHTML = '';
        
        algorithms.forEach((algo, index) => {
            const algoData = this.algorithmData[algo];
            const lane = this.createRaceLane(algo, algoData.name, index);
            raceContainer.appendChild(lane);
            
            // Initialize race state for this algorithm
            this.raceData.states[algo] = {
                array: [...this.originalArray],
                steps: [],
                currentStep: 0,
                stats: { comparisons: 0, swaps: 0, steps: 0, startTime: 0 }
            };
            
            // Generate steps for this algorithm
            this.generateRaceSteps(algo);
        });
        
        // Set up race controls
        document.getElementById('racePlayBtn').onclick = () => this.startRaceAnimation();
    }
    
    createRaceLane(algorithm, name, index) {
        const lane = document.createElement('div');
        lane.className = 'race-lane';
        lane.id = `raceLane${index + 1}`;
        
        lane.innerHTML = `
            <div class="lane-header">
                <span class="algorithm-name">${name}</span>
                <div class="race-stats">
                    <span>Steps: <span class="step-count">0</span></span>
                    <span>Time: <span class="time-count">0.0s</span></span>
                </div>
            </div>
            <canvas class="race-canvas" width="400" height="100"></canvas>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        const canvas = lane.querySelector('.race-canvas');
        this.raceData.canvases[algorithm] = canvas;
        
        return lane;
    }
    
    generateRaceSteps(algorithm) {
        const state = this.raceData.states[algorithm];
        const arrayCopy = [...state.array];
        
        // Use the same step generation logic but store in race state
        const originalStats = this.stats;
        this.stats = state.stats;
        
        const originalSteps = this.steps;
        this.steps = [];
        
        // Generate steps based on algorithm
        switch (algorithm) {
            case 'bubbleSort':
                this.bubbleSortSteps(arrayCopy);
                break;
            case 'selectionSort':
                this.selectionSortSteps(arrayCopy);
                break;
            case 'insertionSort':
                this.insertionSortSteps(arrayCopy);
                break;
            // Add other algorithms as needed
        }
        
        state.steps = [...this.steps];
        
        // Restore original state
        this.steps = originalSteps;
        this.stats = originalStats;
    }
    
    startRaceAnimation() {
        document.getElementById('racePlayBtn').innerHTML = '<i class="fas fa-pause"></i> Racing...';
        document.getElementById('racePlayBtn').disabled = true;
        
        this.raceInProgress = true;
        this.raceStartTime = Date.now();
        
        // Start animation for each algorithm
        Object.keys(this.raceData.states).forEach(algo => {
            this.animateRaceAlgorithm(algo);
        });
    }
    
    animateRaceAlgorithm(algorithm) {
        const state = this.raceData.states[algorithm];
        
        const animate = () => {
            if (!this.raceInProgress || state.currentStep >= state.steps.length) {
                if (state.currentStep >= state.steps.length) {
                    this.finishRaceAlgorithm(algorithm);
                }
                return;
            }
            
            const step = state.steps[state.currentStep];
            state.array = [...step.array];
            state.currentStep++;
            
            // Update race visualization
            this.updateRaceVisualization(algorithm, state);
            
            setTimeout(() => requestAnimationFrame(animate), 50); // Fixed race speed
        };
        
        animate();
    }
    
    updateRaceVisualization(algorithm, state) {
        const canvas = this.raceData.canvases[algorithm];
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / state.array.length;
        const maxHeight = canvas.height - 10;
        const maxValue = Math.max(...this.originalArray);
        
        for (let i = 0; i < state.array.length; i++) {
            const height = (state.array[i] / maxValue) * maxHeight;
            const x = i * barWidth;
            const y = canvas.height - 5 - height;
            
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x, y, barWidth - 1, height);
        }
        
        // Update stats
        const lane = canvas.closest('.race-lane');
        lane.querySelector('.step-count').textContent = state.currentStep;
        lane.querySelector('.time-count').textContent = ((Date.now() - this.raceStartTime) / 1000).toFixed(1) + 's';
        
        // Update progress bar
        const progress = (state.currentStep / state.steps.length) * 100;
        lane.querySelector('.progress-fill').style.width = progress + '%';
    }
    
    finishRaceAlgorithm(algorithm) {
        const lane = document.querySelector(`#raceLane${Object.keys(this.raceData.states).indexOf(algorithm) + 1}`);
        lane.style.boxShadow = '0 0 20px #10B981';
        lane.querySelector('.algorithm-name').style.color = '#10B981';
        
        // Check if this is the first to finish
        const allFinished = Object.values(this.raceData.states).every(state => 
            state.currentStep >= state.steps.length
        );
        
        if (allFinished) {
            this.raceInProgress = false;
            document.getElementById('racePlayBtn').innerHTML = '<i class="fas fa-trophy"></i> Race Complete!';
        }
    }
    
    exitRace() {
        this.raceInProgress = false;
        document.getElementById('raceView').classList.add('hidden');
    }
    
    // Sound system
    playSound(index) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Map array index to frequency (pentatonic scale)
            const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25];
            const freq = frequencies[index % frequencies.length] * (1 + (this.array[index] / 1000));
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }
    
    // Keyboard controls
    handleKeydown(e) {
        // Konami code detection
        if (e.code === this.konamiCode[this.konamiIndex]) {
            this.konamiIndex++;
            if (this.konamiIndex === this.konamiCode.length) {
                this.activateEasterEgg();
                this.konamiIndex = 0;
            }
        } else {
            this.konamiIndex = 0;
        }
        
        // Other keyboard shortcuts
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowRight':
                if (!this.isPlaying) {
                    this.stepForward();
                }
                break;
            case 'ArrowLeft':
                if (!this.isPlaying) {
                    this.stepBackward();
                }
                break;
            case 'r':
                this.resetAnimation();
                break;
        }
    }
    
    activateEasterEgg() {
        this.easterEggMode = true;
        document.getElementById('easterEgg').classList.remove('hidden');
        
        // Add rainbow animation to canvas container
        const container = document.querySelector('.canvas-container');
        container.style.animation = 'rainbow 3s ease infinite';
        
        setTimeout(() => {
            container.style.animation = '';
            this.updateCanvas();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new SortingVisualizer();
    
    // Enable audio context on first user interaction
    document.addEventListener('click', () => {
        if (visualizer.audioContext && visualizer.audioContext.state === 'suspended') {
            visualizer.audioContext.resume();
        }
    }, { once: true });
    
    // Export functionality (mock)
    document.getElementById('exportBtn').addEventListener('click', () => {
        alert('Export functionality would generate a GIF/MP4 of the sorting process. This is a demo implementation.');
    });
});