import { TestBed } from '@angular/core/testing';

import { SqlLiteService } from './sql-lite.service';

describe('SqlLiteService', () => {
  let service: SqlLiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlLiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
