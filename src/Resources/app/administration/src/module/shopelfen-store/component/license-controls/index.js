import template from './license-controls.html.twig'

const { Component } = Shopware;

Component.register('shopelfen-store-license-controls', {
    template,

    props: {
        filterByActive: {
            type: Boolean,
            default: false
        },
        selectedSortingOption: {
            type: String,
            default: 'updated-at'
        }
    },

    data() {
        return {
            sortingOptions: [
                {
                    value: 'updated-at',
                    name: this.$tc('sw-extension.my-extensions.listing.controls.filterOptions.last-updated')
                },
                {
                    value: 'name-asc',
                    name: this.$tc('sw-extension.my-extensions.listing.controls.filterOptions.name-asc')
                },
                {
                    value: 'name-desc',
                    name: this.$tc('sw-extension.my-extensions.listing.controls.filterOptions.name-desc')
                }
            ]
        };
    },

    methods: {
        onToggleFilter(value) {
            this.$emit("update:filter-active", value);
        },

        onChangeSortingOption(value) {
            this.$emit("update:sorting-option", value);
        }
    }
})