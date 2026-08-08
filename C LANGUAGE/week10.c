#include <stdio.h>
#include <stdlib.h>

struct Node {
    int id, h;
    struct Node *l, *r;
};

int max(int a,int b){ return a>b?a:b; }
int h(struct Node* n){ return n?n->h:0; }

struct Node* newNode(int id){
    struct Node* n=(struct Node*)malloc(sizeof(struct Node));
    n->id=id; n->l=n->r=NULL; n->h=1;
    return n;
}

struct Node* rightRotate(struct Node* y){
    struct Node* x=y->l;
    struct Node* t=x->r;
    x->r=y; y->l=t;
    y->h=max(h(y->l),h(y->r))+1;
    x->h=max(h(x->l),h(x->r))+1;
    return x;
}

struct Node* leftRotate(struct Node* x){
    struct Node* y=x->r;
    struct Node* t=y->l;
    y->l=x; x->r=t;
    x->h=max(h(x->l),h(x->r))+1;
    y->h=max(h(y->l),h(y->r))+1;
    return y;
}

int bal(struct Node* n){ return n? h(n->l)-h(n->r):0; }

struct Node* insert(struct Node* n,int id){
    if(!n) return newNode(id);
    if(id<n->id) n->l=insert(n->l,id);
    else if(id>n->id) n->r=insert(n->r,id);
    else return n;

    n->h=1+max(h(n->l),h(n->r));
    int b=bal(n);

    if(b>1 && id<n->l->id) return rightRotate(n);
    if(b<-1 && id>n->r->id) return leftRotate(n);
    if(b>1 && id>n->l->id){ n->l=leftRotate(n->l); return rightRotate(n);}
    if(b<-1 && id<n->r->id){ n->r=rightRotate(n->r); return leftRotate(n);}

    return n;
}

void inorder(struct Node* r){
    if(r){
        inorder(r->l);
        printf("%d ",r->id);
        inorder(r->r);
    }
}

int main(){
    struct Node* root=NULL;
    root=insert(root,10);
    root=insert(root,20);
    root=insert(root,30);
    inorder(root);
    return 0;
}