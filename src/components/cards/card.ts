export default class CardComponent extends HTMLElement {
    private grids: Array<Array<Array<number>>> = [];
    private selectedRow: number = -1;
    private selectedCol: number = -1;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Initialize 4 grids with zeros
        for (let k = 0; k < 4; k++) {
            const grid: Array<Array<number>> = [];
            for (let i = 0; i < 15; i++) {
                grid.push(new Array(15).fill(0));
            }
            this.grids.push(grid);
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.shadowRoot) return;

        const gridsHtml = this.grids.map((grid, gridIndex) =>
            `
            <h1>Tabla ${gridIndex + 1}</h1>
            <div class="grid">${grid.map((row, rowIndex) =>
            row.map((_, colIndex) =>
                `<div class="cell" data-row="${rowIndex}" data-col="${colIndex}" data-grid="${gridIndex}"></div>`
            ).join('')
        ).join('')}</div>
            `
        ).join('');

        this.shadowRoot.innerHTML = `
            <style>
                .grid {
                    display: grid;
                    grid-template-columns: repeat(15, 20px);
                    gap: 2px;
                    margin-bottom: 20px;
                }

                .cell {
                    width: 20px;
                    height: 20px;
                    background-color: white;
                    border: 1px solid #ccc;
                    transition: background-color 0.3s;
                }

                .cell.selected {
                    background-color: blue;
                }

                .cell.neighbor {
                    background-color: yellow; 
                }
            </style>
            
            ${gridsHtml}

            <button id="rookMove">Movimiento de Torre</button>
            <button id="knightMove">Movimiento de Caballo</button>
        `;

        this.shadowRoot.querySelectorAll(".cell").forEach(cellElement => {
            const el = cellElement as HTMLElement;
            el.addEventListener('click', (e) => this.handleCellClick(e));
        });

        this.shadowRoot?.getElementById("rookMove")?.addEventListener('click', () => this.applyRookGradient());
        this.shadowRoot?.getElementById("knightMove")?.addEventListener('click', () => this.applyKnightGradient());
    }

    handleCellClick(event: Event) {
        const target = event.target as HTMLElement;
        const row = parseInt(target.getAttribute("data-row") as string);
        const col = parseInt(target.getAttribute("data-col") as string);

        // Reset previously selected cell
        if (this.selectedRow !== -1 && this.selectedCol !== -1) {
            this.shadowRoot?.querySelectorAll(`.cell[data-row="${this.selectedRow}"][data-col="${this.selectedCol}"]`).forEach(cell => {
                const el = cell as HTMLElement;
                el.classList.remove("selected");
                el.style.backgroundColor = "";
            });
        }

        // Mark new cells as selected across all grids
        this.shadowRoot?.querySelectorAll(`.cell[data-row="${row}"][data-col="${col}"]`).forEach(cell => {
            const el = cell as HTMLElement;
            el.classList.add("selected");
        });

        this.selectedRow = row;
        this.selectedCol = col;

        // Reset neighbors classes
        this.shadowRoot?.querySelectorAll(".cell.neighbor").forEach(cell => {
            const el = cell as HTMLElement;
            el.classList.remove("neighbor");
        });

        // Apply gradient based on proximity
        this.applyGradient(row, col);
    }

    applyGradient(row: number, col: number) {
        const maxDistance = Math.sqrt(15 * 15 + 15 * 15); // max distance in the grid

        this.shadowRoot?.querySelectorAll(".cell").forEach(cellElement => {
            const el = cellElement as HTMLElement;
            const cellRow = parseInt(el.getAttribute("data-row") as string);
            const cellCol = parseInt(el.getAttribute("data-col") as string);

            const distance = Math.sqrt(Math.pow(cellRow - row, 2) + Math.pow(cellCol - col, 2));
            const opacity = (maxDistance - distance) / maxDistance;

            el.style.backgroundColor = `rgba(0, 0, 255, ${opacity})`;
        });
    }

    applyRookGradient() {
        // Reset previous gradient
        this.applyGradient(this.selectedRow, this.selectedCol);

        // Rook moves: same row or same column
        this.shadowRoot?.querySelectorAll(".cell").forEach(cellElement => {
            const el = cellElement as HTMLElement;
            const cellRow = parseInt(el.getAttribute("data-row") as string);
            const cellCol = parseInt(el.getAttribute("data-col") as string);

            if (cellRow === this.selectedRow || cellCol === this.selectedCol) {
                el.classList.add("neighbor");
            }
        });
    }

    applyKnightGradient() {
        // Reset previous gradient
        this.applyGradient(this.selectedRow, this.selectedCol);

        // Knight moves: 2 in one direction, 1 in another (or vice versa)
        const knightMoves = [
            [-2, -1], [-2, 1], [2, -1], [2, 1],
            [-1, -2], [-1, 2], [1, -2], [1, 2]
        ];

        knightMoves.forEach(move => {
            const cellElement = this.shadowRoot?.querySelector(`.cell[data-row="${this.selectedRow + move[0]}"][data-col="${this.selectedCol + move[1]}"]`) as HTMLElement;
            if (cellElement) cellElement.classList.add("neighbor");
        });
    }
}


customElements.define('card-component', CardComponent);


