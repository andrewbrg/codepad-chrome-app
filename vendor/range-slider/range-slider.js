(function () {
    $(document).on('input change', '.range-slider__range', function () {
        var $this = $(this);
        $this.closest('.range-slider').find('.range-slider__value').html($this.val());
    });
})();