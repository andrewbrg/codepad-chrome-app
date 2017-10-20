(function () {
    $(document).on('input', '.range-slider-range', function () {
        var $this = $(this);
        $this.attr('title', $this.val());
    });
})();