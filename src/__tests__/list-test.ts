/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import List = require('../list');
import Maybe = require('../maybe');

describe('List', function() {
  describe('#isEmpty', function() {
    it('returns true for an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const isEmpty = List.isEmpty(list);

      expect(isEmpty).toBe(true);
    });

    it('returns false for a list with one value', function() {
      const list:List.List<number> = List.of<number>(1);
      const isEmpty = List.isEmpty(list);

      expect(isEmpty).toBe(false);
    });

    it('returns false for a list with many values', function() {
      const list:List.List<number> = List.of<number>(1,2,3,4,5);
      const isEmpty = List.isEmpty(list);

      expect(isEmpty).toBe(false);
    });
  });

  describe('#length', function() {
    it('returns zero for an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const length = List.length(list);

      expect(length).toEqualJSON(0);
    });

    it('returns one for a list with one element', function() {
      const list:List.List<number> = List.of<number>(1);
      const length = List.length(list);

      expect(length).toEqualJSON(1);
    });

    it('returns two for a list with two elements', function() {
      const list:List.List<number> = List.of<number>(1,2);
      const length = List.length(list);

      expect(length).toEqualJSON(2);
    });

    it('returns three for a list with three elements', function() {
      const list:List.List<number> = List.of<number>(1,2,4);
      const length = List.length(list);

      expect(length).toEqualJSON(3);
    });
  });

  describe('#cons', function() {
    it('returns a list with the single element when applied to an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const actualList:List.List<number> = List.cons(1, list);

      const expectedList:List.List<number> = List.of<number>(1);

      expect(actualList).toEqualJSON(expectedList);
    });

    it('returns a list with the element appened to the front when applied to a ' +
       'list that already has content', function() {
      const list:List.List<number> = List.of<number>(2,3,4,5);
      const actualList:List.List<number> = List.cons(1, list);

      const expectedList:List.List<number> = List.of<number>(1,2,3,4,5);

      expect(actualList).toEqualJSON(expectedList);
    });
  });

  describe('#map', function() {
    it('returns an empty list when applied to an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const mappedList:List.List<string> = List.map(function(num:number) {
        return num.toString();
      }, list);

      const expectedList:List.List<string> = List.of<string>();

      expect(mappedList).toEqualJSON(expectedList);
    });

    it('returns a mapped list when applied to an list with a single element', function() {
      const list:List.List<number> = List.of<number>(1);
      const mappedList:List.List<string> = List.map(function(num:number) {
        return num.toString();
      }, list);

      const expectedList:List.List<string> = List.of<string>('1');

      expect(mappedList).toEqualJSON(expectedList);
    });

    it('returns a mapped list when applied to an list with two elements', function() {
      const list:List.List<number> = List.of<number>(1,3);
      const mappedList:List.List<string> = List.map(function(num:number) {
        return num.toString();
      }, list);

      const expectedList:List.List<string> = List.of<string>('1','3');

      expect(mappedList).toEqualJSON(expectedList);
    });

    it('returns a mapped list when applied to an list with three elements', function() {
      const list:List.List<number> = List.of<number>(1,3,6);
      const mappedList:List.List<string> = List.map(function(num:number) {
        return num.toString();
      }, list);

      const expectedList:List.List<string> = List.of<string>('1','3','6');

      expect(mappedList).toEqualJSON(expectedList);
    });
  });

  describe('#foldl', function() {
    it('returns the base value when given an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const commaSeparatedStr:string = List.foldl(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });

    it('returns the list folded from the left when given a list of one value', function() {
      const list:List.List<number> = List.of<number>(1);
      const commaSeparatedStr:string = List.foldl(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '1,';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });

    it('returns the list folded from the left when given a list of two values', function() {
      const list:List.List<number> = List.of<number>(1,2);
      const commaSeparatedStr:string = List.foldl(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '1,2,';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });

    it('returns the list folded from the left when given a list of three values', function() {
      const list:List.List<number> = List.of<number>(1,2,3);
      const commaSeparatedStr:string = List.foldr(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '3,2,1,';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });
  });

  describe('#foldr', function() {
    it('returns the base value when given an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const commaSeparatedStr:string = List.foldr(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });

    it('returns the list folded from the right when given a list of one value', function() {
      const list:List.List<number> = List.of<number>(1);
      const commaSeparatedStr:string = List.foldr(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '1,';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });

    it('returns the list folded from the right when given a list of two values', function() {
      const list:List.List<number> = List.of<number>(1,2);
      const commaSeparatedStr:string = List.foldr(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '2,1,';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });

    it('returns the list folded from the right when given a list of three values', function() {
      const list:List.List<number> = List.of<number>(1,2,3);
      const commaSeparatedStr:string = List.foldr(function(soFar:string, num:number):string {
        return soFar + num.toString() + ',';
      },'', list);

      const expectedStr:string = '3,2,1,';

      expect(commaSeparatedStr).toEqualJSON(expectedStr);
    });
  });
  describe('#append', function() {
    it('returns the left list when the right list is empty', function() {
      const list1:List.List<number> = List.of<number>(1);
      const list2:List.List<number> = List.of<number>();
      const actualList:List.List<number> = List.append(list1, list2);

      const expectedList:List.List<number> = List.of<number>(1);

      expect(actualList).toEqualJSON(expectedList);
    });

    it('returns the right list when the left list is empty', function() {
      const list1:List.List<number> = List.of<number>();
      const list2:List.List<number> = List.of<number>(1);
      const actualList:List.List<number> = List.append(list1, list2);

      const expectedList:List.List<number> = List.of<number>(1);

      expect(actualList).toEqualJSON(expectedList);
    });

    it('returns the concatination of the lists when neither is empty', function() {
      const list1:List.List<number> = List.of<number>(1,2);
      const list2:List.List<number> = List.of<number>(3,4);
      const actualList:List.List<number> = List.append(list1, list2);

      const expectedList:List.List<number> = List.of<number>(1,2,3,4);

      expect(actualList).toEqualJSON(expectedList);
    });
  });

  describe('#filter', function() {
    it('returns an an empty list when given an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const filteredList:List.List<number> = List.filter(function(num:number) {
        return num <= 10;
      }, list);

      const expectedList:List.List<number> = List.of<number>();

      expect(filteredList).toEqualJSON(expectedList);
    });

    it('returns an list of only those values which passed the filter function ' +
       'when a non empty list', function() {
      const list:List.List<number> = List.of<number>(1,5,10,15,20,3);
      const filteredList:List.List<number> = List.filter(function(num:number) {
        return num <= 10;
      }, list);

      const expectedList:List.List<number> = List.of<number>(1,5,10,3);

      expect(filteredList).toEqualJSON(expectedList);
    });
  });

  describe('#head', function() {
    it('returns nothing when called on an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const result:Maybe.Maybe<number> = List.head(list);

      const expectedResult = Maybe.Nothing<number>();

      expect(result).toEqualJSON(expectedResult);
    });

    it('the head value when it is not an empty list', function() {
      const list:List.List<number> = List.of<number>(1,5,10,15,20,3);
      const result:Maybe.Maybe<number> = List.head(list);

      const expectedResult = Maybe.Just<number>(1);

      expect(result).toEqualJSON(expectedResult);
    });
  });

  describe('#tail', function() {
    it('returns empty list when called on an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const tail:List.List<number> = List.tail(list);

      const expectedTail = List.of<number>();

      expect(tail).toEqualJSON(expectedTail);
    });

    it('returns the tail value when called on a non empty list', function() {
      const list:List.List<number> = List.of<number>(1,5,10,15,20,3);
      const tail:List.List<number> = List.tail(list);

      const expectedTail = List.of<number>(5,10,15,20,3);

      expect(tail).toEqualJSON(expectedTail);
    });
  });

  describe('#reverse', function() {
    it('returns empty list when called on an empty list', function() {
      const list:List.List<number> = List.of<number>();
      const reversed:List.List<number> = List.reverse(list);

      const expectedList = List.of<number>();

      expect(reversed).toEqualJSON(expectedList);
    });

    it('returns the same list when called on a non empty list of size one', function() {
      const list:List.List<number> = List.of<number>(1);
      const reversed:List.List<number> = List.reverse(list);

      const expectedList = List.of<number>(1);

      expect(reversed).toEqualJSON(expectedList);
    });

    it('returns the reveresed list when called on a non empty list of size n', function() {
      const list:List.List<number> = List.of<number>(1,2,3,4,5);
      const reversed:List.List<number> = List.reverse(list);

      const expectedList = List.of<number>(5,4,3,2,1);

      expect(reversed).toEqualJSON(expectedList);
    });
  });

  describe('#intersperse', function() {
    it('returns empty list when called on an empty list', function() {
      const list:List.List<string> = List.of<string>();
      const reversed:List.List<string> = List.intersperse(',', list);

      const expectedList = List.of<string>();

      expect(reversed).toEqualJSON(expectedList);
    });

    it('returns the list itself for a single element list', function() {
      const list:List.List<string> = List.of<string>('a');
      const reversed:List.List<string> = List.intersperse(',', list);

      const expectedList = List.of<string>('a');

      expect(reversed).toEqualJSON(expectedList);
    });

    it('returns intersperses between elements in a non empty list', function() {
      const list:List.List<string> = List.of<string>('a','b','c','d', 'e');
      const reversed:List.List<string> = List.intersperse(',', list);

      const expectedList = List.of<string>('a',',','b',',','c',',','d',',','e');

      expect(reversed).toEqualJSON(expectedList);
    });
  });

  describe('#fromArray', function() {
    it('constructs a list with elements in correct order', function() {
      const names:string[] = ['a', 'b', 'c', '1', '2', '3'];

      const list:List.List<string> = List.fromArray<string>(names);

      const expectedList = List.of<string>('a','b','c','1','2','3');

      expect(list).toEqualJSON(expectedList);
    });
  });

  describe('#toArray', function() {
    it('constructs an array with elements in correct order', function() {
      const names = List.of<string>('a','b','c','1','2','3');

      const array:string[] = List.toArray(names);

      const expectedArray:string[] = ['a', 'b', 'c', '1', '2', '3'];

      expect(array).toEqualJSON(expectedArray);
    });

    it('constructs an empty array when the list is empty', function() {
      const names = List.of<string>();

      const array:string[] = List.toArray(names);

      const expectedArray:string[] = [];

      expect(array).toEqualJSON(expectedArray);
    });
  });
});
