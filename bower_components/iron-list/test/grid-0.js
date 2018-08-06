

  suite('basic features', function() {
    var list, container;

    setup(function() {
      container = fixture('trivialList');
      list = container.list;
    });


    test('check horizontal rendering', function(done) {
      container.data = buildDataSet(100);

      flush(function() {
        // Validate the first viewport
        for (var i = 0; i < 9; i++) {
          assert.equal(getNthItemFromGrid(list, i).textContent, i);
        }
        done();
      });
    });

    test('first visible index', function(done) {
      container.data = buildDataSet(100);

      flush(function() {
        var setSize = list.items.length;
        var rowHeight = container.itemSize;
        var viewportHeight = list.offsetHeight;
        var scrollToItem;

        function checkFirstVisible() {
          assert.equal(list.firstVisibleIndex, getNthItemRowStart(list, scrollToItem));
          assert.equal(getNthItemFromGrid(list, 0).textContent, getNthItemRowStart(list, scrollToItem));
        }

        function checkLastVisible() {
          var visibleItemsCount = Math.floor(viewportHeight / rowHeight) * list._itemsPerRow;
          var visibleItemStart = getNthItemRowStart(list, scrollToItem);
          assert.equal(list.lastVisibleIndex, visibleItemStart + visibleItemsCount - 1);
          assert.equal(getNthItemFromGrid(list, 8).textContent, visibleItemStart + visibleItemsCount - 1);
        }

        function doneScrollDown() {
          checkFirstVisible();
          checkLastVisible();
          scrollToItem = 1;
          flush(function() {
            simulateScroll({
              list: list,
              contribution: rowHeight,
              target: getGridRowFromIndex(list, scrollToItem)*rowHeight,
              onScrollEnd: doneScrollUp
            });
          });
        }

        function doneScrollUp() {
          checkFirstVisible();
          checkLastVisible();
          done();
        }
        scrollToItem = 50;

        simulateScroll({
          list: list,
          contribution: rowHeight,
          target: getGridRowFromIndex(list, scrollToItem)*rowHeight,
          onScrollEnd: doneScrollDown
        });

      });
    });

    test('scroll to index', function() {
      list.items = buildDataSet(100);
      Polymer.dom.flush();
      list.scrollToIndex(30);
      assert.equal(list.firstVisibleIndex, 30);

      list.scrollToIndex(0);
      assert.equal(list.firstVisibleIndex, 0);

      list.scrollToIndex(60);
      assert.equal(list.firstVisibleIndex, 60);

      var rowHeight = getNthItemFromGrid(list, 0).offsetHeight;
      var viewportHeight = list.offsetHeight;
      var itemsPerViewport = Math.floor(viewportHeight/rowHeight) * list._itemsPerRow;

      list.scrollToIndex(99);
      Polymer.dom.flush();
      // make the height of the viewport same as the height of the row
      // and scroll to the last item
      list.style.height = list._physicalItems[0].offsetHeight + 'px';
      list.fire('iron-resize');

      list.scrollToIndex(99);
      assert.equal(list.firstVisibleIndex, 99);
    });

    test('reset items', function(done) {
      list.items = buildDataSet(100);

      flush(function() {
        assert.equal(getNthItemFromGrid(list, 0).textContent, '0');

        list.items = null;

        flush(function() {
          assert.notEqual(getNthItemFromGrid(list, 0).textContent, '0');
          list.items = buildDataSet(100);

          flush(function() {
            assert.equal(getNthItemFromGrid(list, 0).textContent, '0');
            done();
          });
        });
      });
    });

    test('delete a grid item when the last row should only have one item and scroll to bottom', function(done) {
      list.items = buildDataSet(64);
      Polymer.dom.flush();
      list.shift('items');
      Polymer.dom.flush();
      list.scroll(0, 10000000);
      requestAnimationFrame(function() {
        setTimeout(function() {
          assert.equal(list.lastVisibleIndex, list.items.length - 1);
          done();
        });
      });
    });

    test('Columns per row (#381)', function(done) {
      container.data = buildDataSet(1000);
      container.itemSize = 33.3;
      Polymer.dom.flush();
      list.scroll(0, 5021);

      requestAnimationFrame(function() {
        setTimeout(function() {
          assert.equal(list._physicalStart % list._itemsPerRow, 0);
          assert.equal(list._physicalEnd % list._itemsPerRow, list._itemsPerRow - 1);
          done();
        });
      });
    });

  });
