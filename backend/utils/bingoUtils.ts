export function checkForBingo(matrix: Array<Array<{ text: string; tick: boolean }>>, gameSize: number): number {
    let bingo = 0;

    // Check rows
    for (let i = 0; i < gameSize; i++) {
        if (matrix[i].every(entry => entry.tick)) {
            bingo++;
        }
    }

    // Check columns
    for (let j = 0; j < gameSize; j++) {
        let allTrue = true;
        for (let i = 0; i < gameSize; i++) {
            if (!matrix[i][j].tick) {
                allTrue = false;
                break;
            }
        }
        if (allTrue) {
            bingo++;
        }
    }

    // Check major diagonal (left to right)
    let diagonalTrue = true;
    for (let i = 0; i < gameSize; i++) {
        if (!matrix[i][i].tick) {
            diagonalTrue = false;
            break;
        }
    }
    if (diagonalTrue) {
        bingo++;
    }

    // Check anti-diagonal (right to left)
    let antiDiagonalTrue = true;
    for (let i = 0; i < gameSize; i++) {
        if (!matrix[i][gameSize - 1 - i].tick) {
            antiDiagonalTrue = false;
            break;
        }
    }
    if (antiDiagonalTrue) {
        bingo++;
    }

    return bingo;
}