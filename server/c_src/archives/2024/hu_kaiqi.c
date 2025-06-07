//
// Author: Kaiqi Hu
//

#include <stdio.h>
#include <string.h>
#include <math.h>
#include "lab8part2.h"

void printBoard(char board[][26], int n);
bool positionInBounds(int n, int row, int col);
bool checkLegalInDirection(char board[][26], int n, int row, int col, char colour, int deltaRow, int deltaCol);
bool checkAvailability(char board[][26], int n, char configColor);
void flipPieces(char board[][26], char colorChoice, int rowChoice, int colChoice, int n);
char oppositeColor(char presentColor);
void printWinner(char board[][26], int n);
int getLegalMoves(char board[][26], int n, char configColor, int rowMoves[50], int colMoves[50]);
int makeMove(const char board[][26], int n, char turn, int *row, int *col);
int gameStateEvaluation(char board[][26], int n, char turn);
int minimaxAlg(char board[][26], int n, char turn, char currentTurn, int depth, int alpha, int beta);

int main(void) {

  int n;
//Ask for board dimension
  printf("Enter the board dimension: ");
  scanf(" %d", &n);

//Initialize board
  char board[26][26];

  for(int i = 0; i < n; i++){
    for(int j = 0; j < n; j++){
      if(((i == n/2)&&(j == n/2))||((i == n/2 - 1)&&(j == n/2 - 1))){
        board[i][j] = 'W';
      }
      else if(((i == n/2)&&(j == n/2 - 1))||((i == n/2 - 1)&&(j == n/2))){
        board[i][j] = 'B';
      }
      else{
        board[i][j] = 'U';
      }
    }
  }

//Ask computer to play B/W
  char compColor;
  printf("Computer plays (B/W): ");
  scanf(" %c", &compColor);

//Print out the board
  printBoard(board, n);

//Initialize turn
  char turn = 'B';

//Check availability & make moves
  while(checkAvailability(board, n, turn) == true){

    if(turn == compColor){

      int bestRow = -1;
      int bestCol = -1;
//Computer choose and make move
      makeMove(board, n, turn, &bestRow, &bestCol);
      flipPieces(board, turn, bestRow, bestCol, n);

// totalTime now holds the time (in seconds) it takes to run your code
      printf("Computer places %c at %c%c.\n", compColor, 'a' + bestRow, 'a' + bestCol);
      printBoard(board, n);

    }else{
      char rowEntered, colEntered;
      int deltaRowx, deltaColx;

      printf("Enter move for colour %c (RowCol): ", turn);
      scanf(" %c%c", &rowEntered, &colEntered);

      int rowNum = rowEntered - 'a';
      int colNum = colEntered - 'a';
      bool validity = false;

//Determine validity & flip tiles
      if(board[rowNum][colNum] == 'U'){
        for(deltaRowx = -1; deltaRowx <= 1; deltaRowx++){
          for(deltaColx = -1; deltaColx <= 1; deltaColx++){

            if((deltaRowx == 0)&&(deltaColx == 0)){
              continue;
            }

            if(checkLegalInDirection(board, n, rowNum, colNum, turn, deltaRowx, deltaColx) == true){
              validity = true;
              break;
            }   
          }
        }
      }
//If valid move, flip tiles
      if(validity == true){

        board[rowNum][colNum] = turn;
        flipPieces(board, turn, rowNum, colNum, n);
        printBoard(board, n);

      }else{
//if invalid, end game, computer wins
        printf("Invalid move.\n");
        printf("%c player wins.", oppositeColor(turn));
        break;
      }
    }
    if(checkAvailability(board, n, oppositeColor(turn)) == true){
      turn = oppositeColor(turn);
    }
    else if(checkAvailability(board, n, turn) == true){
      printf("%c player has no valid move.\n", oppositeColor(turn));
    }
    else{
      printWinner(board, n);
    }
  }
  return 0;
}

void printBoard(char board[][26], int n) {

  printf("  ");

  for(int i = 0; i < n; i++){
    printf("%c", 'a' + i);
  }

  printf("\n");

  for(int i = 0; i < n; i++){
    printf("%c", 'a' + i);
    printf(" ");
    
    for(int j = 0; j < n; j++){
      printf("%c", board[i][j]);
    }
    printf("\n");
  }
}

bool positionInBounds(int n, int row, int col) {

  if((row >= 0)&&(row < n)&&(col >= 0)&&(col < n)){
    return true;
  }else{
    return false;
  }
}

bool checkLegalInDirection(char board[][26], int n, int row, int col, char colour, int deltaRow, int deltaCol) {

    int i = row + deltaRow;
    int j = col + deltaCol;
    bool hasOpponentPiece = false;

    while (positionInBounds(n, i, j)) {

        if (board[i][j] == oppositeColor(colour)) {

            hasOpponentPiece = true;
            i += deltaRow;
            j += deltaCol;
            
        } else if (board[i][j] == colour && hasOpponentPiece) {
            return true; 
        } else {
            break; 
        }
    }
    return false;
}

bool checkAvailability(char board[][26], int n, char configColor){

  int deltaRow;
  int deltaCol;
  bool found = false;

  for(int i = 0; i < n; i++){
    for(int j = 0; j < n; j++){

      if(board[i][j] == 'U'){

        for(deltaRow = -1; deltaRow <= 1 && !found; deltaRow++){
          for(deltaCol = -1; deltaCol <= 1; deltaCol++){

            if(checkLegalInDirection(board, n, i, j, configColor, deltaRow, deltaCol) == true){

              found = true;
              break;
            }
          }
          if(found == true){break;}
        }
      }
      if(found == true){break;}
    }
    if(found == true){break;}
  } 
  return found;
}

void flipPieces(char board[][26], char colorChoice, int rowChoice, int colChoice, int n){

  int deltaRow, deltaCol;
  board[rowChoice][colChoice] = colorChoice;

  for(deltaRow = -1; deltaRow <= 1; deltaRow++){
    for(deltaCol = -1; deltaCol <= 1; deltaCol++){

      if((deltaRow == 0)&&(deltaCol == 0)){
        continue;
      }

      if(checkLegalInDirection(board, n, rowChoice, colChoice, colorChoice, deltaRow, deltaCol) == true){    
        
        int curRow = rowChoice + deltaRow;
        int curCol = colChoice + deltaCol;
      
      
        while(board[curRow][curCol] != colorChoice){
          
          board[curRow][curCol] = colorChoice;
          curRow += deltaRow;
          curCol += deltaCol;
        }
      }
    }
  }
}

char oppositeColor(char presentColor){

  char oppositeColor = 'W';

  if(presentColor == 'W'){
    oppositeColor = 'B';
  }
  return oppositeColor;
}

void printWinner(char board[][26], int n){

  int wCount = 0;
  int bCount = 0;

  for(int i = 0; i < n; i++){
    for(int j = 0; j < n; j++){

      if(board[i][j] == 'W'){
        wCount++;
      }else if(board[i][j] == 'B'){
        bCount++;
      }
    }
  }
  if(wCount < bCount){
    printf("B player wins.");
  }
  else if(wCount > bCount){
    printf("W player wins.");
  }
  else{
    printf("Draw!");
  }
}

int gameStateEvaluation(char board[][26], int n, char turn) {
    int myScore = 0;
    int oppScore = 0;


    int cornerWeight = 17;  
    int mobilityWeight = 10;  
    int pieceWeight = 1;  


    int corners[4][2] = {{0, 0}, {0, n - 1}, {n - 1, 0}, {n - 1, n - 1}};

    for (int i = 0; i < 4; i++) {
        if (board[corners[i][0]][corners[i][1]] == turn) {
            myScore += cornerWeight;
        } else if (board[corners[i][0]][corners[i][1]] == oppositeColor(turn)) {
            oppScore += cornerWeight;
        }
    }

    int myMoves[66], oppMoves[66];
    int myNumMoves = getLegalMoves(board, n, turn, myMoves, oppMoves);
    int oppNumMoves = getLegalMoves(board, n, oppositeColor(turn), myMoves, oppMoves);
    myScore += mobilityWeight * myNumMoves;
    oppScore += mobilityWeight * oppNumMoves;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (board[i][j] == turn) {
                myScore += pieceWeight;
            } else if (board[i][j] == oppositeColor(turn)) {
                oppScore += pieceWeight;
            }
        }
    }

    return (myScore - oppScore);
}


int getLegalMoves(char board[][26], int n, char configColor, int rowMoves[50], int colMoves[50]){

  int deltaRow, deltaCol;
  int numOfMoves = 0;
  bool found;

  for(int i = 0; i < n; i++){
    for(int j = 0; j < n; j++){

      if(board[i][j] == 'U'){
        found = false;

        for(deltaRow = -1; deltaRow <= 1 && !found; deltaRow++){
          for(deltaCol = -1; deltaCol <= 1; deltaCol++){

            if(checkLegalInDirection(board, n, i, j, configColor, deltaRow, deltaCol) == true){

              rowMoves[numOfMoves] = i;
              colMoves[numOfMoves] = j;
              numOfMoves++;

              found = true;
              break;
            }
          }
        }
      }
    }
  } 
  return numOfMoves;
}

int makeMove(const char board[][26], int n, char turn, int *row, int *col){

  char boardOne[26][26];
  memcpy(boardOne, board, 26 * 26 * sizeof(char));
  int numMoves = 0;
  int maxValue, bestX, bestY;
  int rowMoves[50], colMoves[50];
  char oppositeTurn = oppositeColor(turn);

  numMoves = getLegalMoves(boardOne, n, turn, rowMoves, colMoves);

  if(numMoves == 0){
    *row = -1;
    *col = -1;
  }
  else{

    maxValue = -99999;
    bestX = rowMoves[0];
    bestY = colMoves[0];
    
    for(int i = 0; i < numMoves; i++){

      char newBoard[26][26];
      memcpy(newBoard, boardOne, 26 * 26 * sizeof(char));
      flipPieces(newBoard, turn, rowMoves[i], colMoves[i], n);

      int val = minimaxAlg(newBoard, n, turn, oppositeTurn, 5, -99999, 99999);
      if(val > maxValue){

        maxValue = val;
        bestX = rowMoves[i];
        bestY = colMoves[i]; 
      }     
    }
    *row = bestX;
    *col = bestY;
  }
  return -1;
}

int minimaxAlg(char board[][26], int n, char turn, char currentTurn, int depth, int alpha, int beta) {
    int numMoves = 0;
    int maxValue = 0;
    int rowMoves[50];
    int colMoves[50];
    char opponentTurn = oppositeColor(currentTurn);

    if ((depth == 0) || ((checkAvailability(board, n, turn) == false) && (checkAvailability(board, n, oppositeColor(turn))))) {
        return gameStateEvaluation(board, n, turn);
    }

    numMoves = getLegalMoves(board, n, currentTurn, rowMoves, colMoves);
    if (numMoves == 0) {
        return minimaxAlg(board, n, turn, currentTurn, depth - 1, alpha, beta);
    } else {
        if (turn == currentTurn) {
            maxValue = -99999;
            for (int i = 0; i < numMoves; i++) {
                char newBoard[26][26];
                memcpy(newBoard, board, 26 * 26 * sizeof(char));
                flipPieces(newBoard, currentTurn, rowMoves[i], colMoves[i], n);
                int val = minimaxAlg(newBoard, n, turn, opponentTurn, depth - 1, alpha, beta);
                if (val > maxValue) {
                    maxValue = val;
                }
                alpha = (alpha > val) ? alpha : val;
                if (beta <= alpha) {
                    break; 
                }
            }
            return maxValue;
        } else {
            maxValue = 99999;
            for (int i = 0; i < numMoves; i++) {
                char newBoard[26][26];
                memcpy(newBoard, board, 26 * 26 * sizeof(char));
                flipPieces(newBoard, currentTurn, rowMoves[i], colMoves[i], n);
                int val = minimaxAlg(newBoard, n, turn, opponentTurn, depth - 1, alpha, beta);
                if (val < maxValue) {
                    maxValue = val;
                }
                beta = (beta < val) ? beta : val;
                if (beta <= alpha) {
                    break; 
                }
            }
            return maxValue;
        }
    }
    return -1;
}