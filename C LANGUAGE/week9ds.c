#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Node {
    int id;
    char username[50];
    char name[100];
    struct Node *left, *right;
};

struct Node* createNode(int id, char username[], char name[]) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->id = id;
    strcpy(newNode->username, username);
    strcpy(newNode->name, name);
    newNode->left = newNode->right = NULL;
    return newNode;
}

struct Node* insert(struct Node* root, int id, char username[], char name[]) {
    if (root == NULL)
        return createNode(id, username, name);

    if (strcmp(username, root->username) < 0)
        root->left = insert(root->left, id, username, name);
    else if (strcmp(username, root->username) > 0)
        root->right = insert(root->right, id, username, name);
    else
        printf("Username already exists\n");

    return root;
}

void inorder(struct Node* root) {
    if (root != NULL) {
        inorder(root->left);
        printf("ID: %d Username: %s Name: %s\n", root->id, root->username, root->name);
        inorder(root->right);
    }
}

struct Node* search(struct Node* root, char username[]) {
    if (root == NULL || strcmp(root->username, username) == 0)
        return root;

    if (strcmp(username, root->username) < 0)
        return search(root->left, username);
    else
        return search(root->right, username);
}

int main() {
    struct Node* root = NULL;
    int choice, id;
    char username[50], name[100];

    while (1) {
        printf("1. Add Friend\n2. Search Friend\n3. Display Friends\n4. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        if (choice == 1) {
            printf("Enter Unique ID: ");
            scanf("%d", &id);
            printf("Enter Username: ");
            scanf("%s", username);
            printf("Enter Display Name: ");
            getchar();
            fgets(name, sizeof(name), stdin);
            name[strcspn(name, "\n")] = 0;
            root = insert(root, id, username, name);
        }
        else if (choice == 2) {
            printf("Enter Username to Search: ");
            scanf("%s", username);
            struct Node* found = search(root, username);
            if (found)
                printf("Friend Found\nID: %d\nUsername: %s\nName: %s\n", found->id, found->username, found->name);
            else
                printf("Friend not found\n");
        }
        else if (choice == 3) {
            printf("Friend List (Sorted by Username):\n");
            inorder(root);
        }
        else if (choice == 4) {
            break;
        }
    }

    return 0;
}