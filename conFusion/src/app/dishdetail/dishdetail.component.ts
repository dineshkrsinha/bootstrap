import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';

import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Comment } from '../shared/comment';

import 'rxjs/add/operator/switchMap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { visibility, expand, flyInOut } from '../animations/app.animation';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    }
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishcopy = null;
  dishIds: number[];
  prev: number;
  next: number;
  errMess: string;

  commentForm: FormGroup;
  comment: Comment;

  visibility = 'shown';


  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required':      'Author is required.',
      'minlength':     'Author must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Comment is required.'
    }
  };


  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) 
    { 
      this.createForm();
      this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
    }

    createForm() {
      this.commentForm = this.fb.group({
        rating: 5,
        author: ['', [Validators.required, Validators.minLength(2)] ],
        date: '',
        comment: ['', [Validators.required] ]
      });
    }

    onSubmit() {
      this.comment = this.commentForm.value;
      this.comment.date = Date().toString();
      console.log(this.comment);

      this.dishcopy.comments.push(this.comment);
      this.dishcopy.save()
        .subscribe(dish => { this.dish = dish; console.log(this.dish); });

      this.addToList(this.comment);
      this.commentForm.reset({
        rating: 5,
        author: '',
        date: '',
        comment: ''
      });
    }

  ngOnInit() {

    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .switchMap((params: Params) => {this.visibility = 'hidden'; 
                return this.dishservice.getDish(+params['id'])})
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish;
                          this.setPrevNext(dish.id); 
                          this.visibility = 'shown'; },
                errmess => this.errMess = <any>errmess);

    let id = +this.route.snapshot.params['id'];
    this.dishservice.getDish(id)
      .subscribe(dish => this.dish = dish);
  }

  goBack(): void {
    this.location.back();
  }

  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }

  removeLastFromList()
  {
    if(this.dish.comments.length <=  5)
      return;

    var lastObject = this.dish.comments[this.dish.comments.length-1];
    if ('date' in lastObject)
      if(lastObject.date)
        return;     
   
        this.dish.comments.splice(this.dish.comments.length-1,1); 

  }


  addToList(newComment: Comment)
  {
    this.removeLastFromList();
   
    this.dish.comments.push(newComment);
  }


  onValueChanged(data?: any) {
    var isFormValid = true;
    var newComment;

    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
   
      if(!control)
        continue;
      if (!("valid" in control) )
      {
         continue;
      }
      if(!control.dirty){
        console.log("dinesh: control nothing");
        isFormValid = false;
      }
      else if(!control.valid)
      {
        isFormValid = false;

      }
       
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';          
        }
      }
    }
    if(isFormValid)
    {

      newComment =  {
        'rating': form.get("rating").value,
        'author': form.get("author").value,
        'date': "",
        'comment': form.get("comment").value
      };
      

      this.addToList(newComment);
    }

  }


}
