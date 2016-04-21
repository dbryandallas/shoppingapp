
(function () {
    "use strict";

    // Shopping list model
    function ShoppingList() {
        this.restore();
    }
    ShoppingList.prototype = {
        addItem: function addItem(item) {
            var id = "item_" + (this.id)++;
            this.items[id] = {name: item, completed: false};
            this.updateStorage();
            return id;
        },
        getItem: function getItem(id) {
            return this.items[id];
        },
        removeItem: function removeItem(id) {
            delete this.items[id];
            this.updateStorage();
        },
        updateItem: function updateItem(id, name) {
            this.items[id].name = name;
            this.updateStorage();
        },
        toggleItem: function toggleItem(id) {
            this.items[id].completed = !this.items[id].completed;
            this.updateStorage();
        },
        updateStorage: function updateStorage() {
            localStorage.shoppingListItems = JSON.stringify(this.items);
            localStorage.shoppingListID = this.id;
        },
        restore: function restore() {
            if (localStorage.shoppingListItems) {
                this.items = JSON.parse(localStorage.shoppingListItems);
                this.id = parseInt(localStorage.shoppingListID, 10);
            } else {
                this.items = {};
                this.id = 0;
            }
        },
        getIDs: function getIDs() {
            return Object.keys(this.items);
        },
        count: function count() {
            return Object.keys(this.items).length;
        }
    };

    $(document).ready(function() {

        var newItem = $('#new_item'),
            itemsList = $('.items'),
            checkAll = $('#check_all'),
            removeAll = $('#remove_all'),
            newItemTemplate = $('#list_item_template').text(),
            shoppingList = new ShoppingList();

        // Controller functions
        function removeItem(bypassConfirm) {
            var targetItem = $(this),
                listItem = targetItem.parent(),
                id = listItem.attr('id'),
                confirmed = true;
            if (bypassConfirm !== true) {
                confirmed = confirm('Are you sure you wish to remove this item?');
            }
            if (confirmed) {
                // Remove item from list model
                shoppingList.removeItem(id);
                // Animate list item removal
                listItem.toggle(400, function () {
                    // Remove item from list view
                    listItem.remove();
                    updateCount();
                });
            }
        }

        function toggleItem() {
            var targetItem = $(this),
                listItem = targetItem.parent(),
                id = listItem.attr('id');
            // Toggle completion in shopping list
            shoppingList.toggleItem(id);
            // Toggle checkmark
            targetItem.toggleClass('checkbox_complete');
            // Toggle strike through
            listItem.find('.item_text').toggleClass('item_complete');
        }

        function updateItem() {
            var targetItem = $(this),
                listItem = targetItem.parent(),
                id = listItem.attr('id'),
                newName = targetItem.text();
            if (Boolean(newName) && !newName.match(/^\s+$/)) {
                shoppingList.updateItem(id, newName);
                targetItem.blur();
            }
        }

        function addListItemBehaviors(item) {
            item.find('.checkbox').click(toggleItem);
            item.find('.remover').click(removeItem);
            item.find('.item_text').keydown(function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    updateItem.apply(this);
                }
            });
        }

        function addItem() {
            var targetItem = $(this),
                itemName = targetItem.val(),
                newListItem = $(newItemTemplate),
                id = null;
            // Ignore black or whitespace-only entries
            if (Boolean(itemName) && !itemName.match(/^\s+$/)) {
                id = shoppingList.addItem(itemName);
                // Reset item entry input box
                newItem.val('');
                // Update template
                newListItem.attr('id', id);
                newListItem.find('.item_text').text(itemName);
                addListItemBehaviors(newListItem);
                newListItem.hide();
                // Add item to the view list
                itemsList.append(newListItem);
                // Animate item appearance
                newListItem.toggle('400');
                updateCount();
            }
        }

        function restoreItem(id, item) {
            var newListItem = $(newItemTemplate);
            // Rebuild item markup
            newListItem.attr('id', id);
            newListItem.find('.item_text').text(item.name);
            addListItemBehaviors(newListItem);
            // Match item completion status
            if (item.completed) {
                newListItem.find('.checkbox').toggleClass('checkbox_complete');
                newListItem.find('.item_text').toggleClass('item_complete');
            }
            itemsList.append(newListItem);
        }

        function restoreItems() {
            shoppingList.getIDs().map(function (id) {
                restoreItem(id, shoppingList.getItem(id));
            });
            updateCount();
        }

        function updateCount() {
            $('#item_count').text(shoppingList.count() + ' item(s)');
        }

        function checkAllItems() {
            $('.checkbox').not('.checkbox_complete').each(function (idx, val) {
                toggleItem.apply(val);
            });
        }

        function removeAllCheckedItems() {
            if (shoppingList.count() &&
                    confirm('Are you sure you want to remove all checked items?')) {
                $('.checkbox_complete').each(function (idx, val) {
                    removeItem.apply(val, [true]);
                });
            }
        }

        // Restore previous shopping list items
        restoreItems();

        // Set event handler for new list items
        newItem.keydown(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                addItem.apply(this);
            }
        });
        // Add event handlers for multi control buttons
        checkAll.click(checkAllItems);
        removeAll.click(removeAllCheckedItems);
    });
}());
