(function () {
    $(document).on('change', '.range-slider-range', function () {
        var $this = $(this);
        $this.closest('.range-slider').find('.range-slider-value').html($this.val());
    });
})();