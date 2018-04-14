import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import { Http, Response } from '@angular/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

import { Feedback } from '../shared/feedback';


@Injectable()
export class FeedbackService {
  feedbackcopy = null;

  constructor(private restangular: Restangular,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

    submitFeedback(feedback: Feedback): Observable<Feedback> {
      this.feedbackcopy = feedback;
      this.feedbackcopy.save()
        .subscribe(feedback => { this.feedbackcopy = feedback; });
      return  this.feedbackcopy;
    }

}
