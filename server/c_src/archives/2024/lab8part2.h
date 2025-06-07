/*
 * File: reversi.h 
 * Author: APS105H1 Teaching Team
 *
 * Date: February 2022
 */

// NOTE: Do NOT change this file, add more functions to your C file
#ifndef SKELETON_H
#define SKELETON_H

#include <stdbool.h>

// Function Declarations for Part 1
void printBoard(char board[][26], int n);
bool positionInBounds(int n, int row, int col);
bool checkLegalInDirection(char board[][26], int n, int row, 
                           int col, char colour, int deltaRow, int deltaCol);

// Function Declaration for Part 2
int makeMove(const char board[][26], int n, char turn, int *row, int *col);

#endif
