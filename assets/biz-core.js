//custom jquery method for toggle attr
$.fn.toggleAttr = function (attr, attr1, attr2) {
    return this.each(function () {
        var self = $(this);
        if (self.attr(attr) == attr1) self.attr(attr, attr2);
        else self.attr(attr, attr1);
    });
};
(function ($) {
    // USE STRICT
    "use strict";

    // AIZ.data = {
    //     csrf: $('meta[name="csrf-token"]').attr("content"),
    //     appUrl: $('meta[name="app-url"]').attr("content"),
    //     fileBaseUrl: $('meta[name="file-base-url"]').attr("content"),
    // };
    AIZ.data = {
        csrf: $('meta[name="csrf-token"]').attr("content"),
        appUrl: 'http://localhost/exp/',
        fileBaseUrl: 'http://localhost/exp/aiz-uploader/',
    };
    AIZ.uploader = {
        data: {
            selectedFiles: [],
            selectedFilesObject: [],
            clickedForDelete: null,
            allFiles: [],
            multiple: false,
            type: "all",
            next_page_url: null,
            prev_page_url: null,
        },
        removeInputValue: function (id, array, elem) {
            var selected = array.filter(function (item) {
                return item !== id;
            });
            if (selected.length > 0) {
                $(elem)
                    .find(".file-amount")
                    .html(AIZ.uploader.updateFileHtml(selected));
            } else {
                elem.find(".file-amount").html(AIZ.local.choose_file);
            }
            $(elem).find(".selected-files").val(selected);
        },
        removeAttachment: function () {
            $(document).on("click", '.remove-attachment', function () {
                var value = $(this)
                    .closest(".file-preview-item")
                    .data("id");
                var selected = $(this)
                    .closest(".file-preview")
                    .prev('[data-toggle="aizuploader"]')
                    .find(".selected-files")
                    .val()
                    .split(",")
                    .map(Number);

                AIZ.uploader.removeInputValue(
                    value,
                    selected,
                    $(this)
                        .closest(".file-preview")
                        .prev('[data-toggle="aizuploader"]')
                );
                $(this).closest(".file-preview-item").remove();
            });
        },
        deleteUploaderFile: function () {
            $(".aiz-uploader-delete").each(function () {
                $(this).on("click", function (e) {
                    e.preventDefault();
                    var id = $(this).data("id");
                    AIZ.uploader.data.clickedForDelete = id;
                    $("#aizUploaderDelete").modal("show");

                    $(".aiz-uploader-confirmed-delete").on("click", function (
                        e
                    ) {
                        e.preventDefault();
                        if (e.detail === 1) {
                            var clickedForDeleteObject =
                                AIZ.uploader.data.allFiles[
                                AIZ.uploader.data.allFiles.findIndex(
                                    (x) =>
                                        x.id ===
                                        AIZ.uploader.data.clickedForDelete
                                )
                                ];
                            $.ajax({
                                url:
                                    AIZ.data.appUrl +
                                    "/aiz-uploader/destroy/" +
                                    AIZ.uploader.data.clickedForDelete,
                                type: "DELETE",
                                dataType: "JSON",
                                data: {
                                    id: AIZ.uploader.data.clickedForDelete,
                                    _method: "DELETE",
                                    _token: AIZ.data.csrf,
                                },
                                success: function () {
                                    AIZ.uploader.data.selectedFiles = AIZ.uploader.data.selectedFiles.filter(
                                        function (item) {
                                            return (
                                                item !==
                                                AIZ.uploader.data
                                                    .clickedForDelete
                                            );
                                        }
                                    );
                                    AIZ.uploader.data.selectedFilesObject = AIZ.uploader.data.selectedFilesObject.filter(
                                        function (item) {
                                            return (
                                                item !== clickedForDeleteObject
                                            );
                                        }
                                    );
                                    AIZ.uploader.updateUploaderSelected();
                                    AIZ.uploader.getAllUploads(
                                        AIZ.data.appUrl +
                                        "/aiz-uploader/get_uploaded_files"
                                    );
                                    AIZ.uploader.data.clickedForDelete = null;
                                    $("#aizUploaderDelete").modal("hide");
                                },
                            });
                        }
                    });
                });
            });
        },
        uploadSelect: function () {
            $(".aiz-uploader-select").each(function () {
                var elem = $(this);
                elem.on("click", function (e) {
                    var value = $(this).data("value");
                    var valueObject =
                        AIZ.uploader.data.allFiles[
                        AIZ.uploader.data.allFiles.findIndex(
                            (x) => x.id === value
                        )
                        ];
                    // console.log(valueObject);

                    elem.closest(".aiz-file-box-wrap").toggleAttr(
                        "data-selected",
                        "true",
                        "false"
                    );
                    if (!AIZ.uploader.data.multiple) {
                        elem.closest(".aiz-file-box-wrap")
                            .siblings()
                            .attr("data-selected", "false");
                    }
                    if (!AIZ.uploader.data.selectedFiles.includes(value)) {
                        if (!AIZ.uploader.data.multiple) {
                            AIZ.uploader.data.selectedFiles = [];
                            AIZ.uploader.data.selectedFilesObject = [];
                        }
                        AIZ.uploader.data.selectedFiles.push(value);
                        AIZ.uploader.data.selectedFilesObject.push(valueObject);
                    } else {
                        AIZ.uploader.data.selectedFiles = AIZ.uploader.data.selectedFiles.filter(
                            function (item) {
                                return item !== value;
                            }
                        );
                        AIZ.uploader.data.selectedFilesObject = AIZ.uploader.data.selectedFilesObject.filter(
                            function (item) {
                                return item !== valueObject;
                            }
                        );
                    }
                    AIZ.uploader.addSelectedValue();
                    AIZ.uploader.updateUploaderSelected();
                });
            });
        },
        updateFileHtml: function (array) {
            var fileText = "";
            if (array.length > 1) {
                var fileText = AIZ.local.files_selected;
            } else {
                var fileText = AIZ.local.file_selected;
            }
            return array.length + " " + fileText;
        },
        updateUploaderSelected: function () {
            $(".aiz-uploader-selected").html(
                AIZ.uploader.updateFileHtml(AIZ.uploader.data.selectedFiles)
            );
        },
        clearUploaderSelected: function () {
            $(".aiz-uploader-selected-clear").on("click", function () {
                AIZ.uploader.data.selectedFiles = [];
                AIZ.uploader.addSelectedValue();
                AIZ.uploader.addHiddenValue();
                AIZ.uploader.resetFilter();
                AIZ.uploader.updateUploaderSelected();
                AIZ.uploader.updateUploaderFiles();
            });
        },
        resetFilter: function () {
            $('[name="aiz-uploader-search"]').val("");
            $('[name="aiz-show-selected"]').prop("checked", false);
            $('[name="aiz-uploader-sort"] option[value=newest]').prop(
                "selected",
                true
            );
        },
        getAllUploads: function (url, search_key = null, sort_key = null) {
            $(".aiz-uploader-all").html(
                '<div class="align-items-center d-flex h-100 justify-content-center w-100"><div class="spinner-border" role="status"></div></div>'
            );
            var params = {};
            if (search_key != null && search_key.length > 0) {
                params["search"] = search_key;
            }
            if (sort_key != null && sort_key.length > 0) {
                params["sort"] = sort_key;
            }
            else {
                params["sort"] = 'newest';
            }
            $.get(url, params, function (data, status) {
                //console.log(data);
                if (typeof data == 'string') {
                    data = JSON.parse(data);
                }
                AIZ.uploader.data.allFiles = data.data;
                AIZ.uploader.allowedFileType();
                AIZ.uploader.addSelectedValue();
                AIZ.uploader.addHiddenValue();
                //AIZ.uploader.resetFilter();
                AIZ.uploader.updateUploaderFiles();
                if (data.next_page_url != null) {
                    AIZ.uploader.data.next_page_url = data.next_page_url;
                    $("#uploader_next_btn").removeAttr("disabled");
                } else {
                    $("#uploader_next_btn").attr("disabled", true);
                }
                if (data.prev_page_url != null) {
                    AIZ.uploader.data.prev_page_url = data.prev_page_url;
                    $("#uploader_prev_btn").removeAttr("disabled");
                } else {
                    $("#uploader_prev_btn").attr("disabled", true);
                }
            });
        },
        showSelectedFiles: function () {
            $('[name="aiz-show-selected"]').on("change", function () {
                if ($(this).is(":checked")) {
                    // for (
                    //     var i = 0;
                    //     i < AIZ.uploader.data.allFiles.length;
                    //     i++
                    // ) {
                    //     if (AIZ.uploader.data.allFiles[i].selected) {
                    //         AIZ.uploader.data.allFiles[
                    //             i
                    //         ].aria_hidden = false;
                    //     } else {
                    //         AIZ.uploader.data.allFiles[
                    //             i
                    //         ].aria_hidden = true;
                    //     }
                    // }
                    AIZ.uploader.data.allFiles =
                        AIZ.uploader.data.selectedFilesObject;
                } else {
                    // for (
                    //     var i = 0;
                    //     i < AIZ.uploader.data.allFiles.length;
                    //     i++
                    // ) {
                    //     AIZ.uploader.data.allFiles[
                    //         i
                    //     ].aria_hidden = false;
                    // }
                    AIZ.uploader.getAllUploads(
                        AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files"
                    );
                }
                AIZ.uploader.updateUploaderFiles();
            });
        },
        searchUploaderFiles: function () {
            $('[name="aiz-uploader-search"]').on("keyup", function () {
                var value = $(this).val();
                AIZ.uploader.getAllUploads(
                    AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files",
                    value,
                    $('[name="aiz-uploader-sort"]').val()
                );
                // if (AIZ.uploader.data.allFiles.length > 0) {
                //     for (
                //         var i = 0;
                //         i < AIZ.uploader.data.allFiles.length;
                //         i++
                //     ) {
                //         if (
                //             AIZ.uploader.data.allFiles[
                //                 i
                //             ].file_original_name
                //                 .toUpperCase()
                //                 .indexOf(value) > -1
                //         ) {
                //             AIZ.uploader.data.allFiles[
                //                 i
                //             ].aria_hidden = false;
                //         } else {
                //             AIZ.uploader.data.allFiles[
                //                 i
                //             ].aria_hidden = true;
                //         }
                //     }
                // }
                //AIZ.uploader.updateUploaderFiles();
            });
        },
        sortUploaderFiles: function () {
            $('[name="aiz-uploader-sort"]').on("change", function () {
                var value = $(this).val();
                AIZ.uploader.getAllUploads(
                    AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files",
                    $('[name="aiz-uploader-search"]').val(),
                    value
                );

                // if (value === "oldest") {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             return (
                //                 new Date(a.created_at) - new Date(b.created_at)
                //             );
                //         }
                //     );
                // } else if (value === "smallest") {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             return a.file_size - b.file_size;
                //         }
                //     );
                // } else if (value === "largest") {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             return b.file_size - a.file_size;
                //         }
                //     );
                // } else {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             a = new Date(a.created_at);
                //             b = new Date(b.created_at);
                //             return a > b ? -1 : a < b ? 1 : 0;
                //         }
                //     );
                // }
                //AIZ.uploader.updateUploaderFiles();
            });
        },
        addSelectedValue: function () {
            for (var i = 0; i < AIZ.uploader.data.allFiles.length; i++) {
                if (
                    !AIZ.uploader.data.selectedFiles.includes(
                        AIZ.uploader.data.allFiles[i].id
                    )
                ) {
                    AIZ.uploader.data.allFiles[i].selected = false;
                } else {
                    AIZ.uploader.data.allFiles[i].selected = true;
                }
            }
        },
        addHiddenValue: function () {
            for (var i = 0; i < AIZ.uploader.data.allFiles.length; i++) {
                AIZ.uploader.data.allFiles[i].aria_hidden = false;
            }
        },
        allowedFileType: function () {
            if (AIZ.uploader.data.type !== "all") {
                let type = AIZ.uploader.data.type.split(',')
                AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.filter(
                    function (item) {
                        return type.includes(item.type);
                    }
                );
            }
        },
        updateUploaderFiles: function () {
            $(".aiz-uploader-all").html(
                '<div class="align-items-center d-flex h-100 justify-content-center w-100"><div class="spinner-border" role="status"></div></div>'
            );

            var data = AIZ.uploader.data.allFiles;
            setTimeout(function () {
                $(".aiz-uploader-all").html(null);

                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var thumb = "";
                        var hidden = "";
                        if (data[i].type === "image") {
                            thumb =
                                '<img src="' +
                                AIZ.data.fileBaseUrl +
                                data[i].file_name +
                                '" class="img-fit">';
                        } else {
                            thumb = '<i class="la la-file-text"></i>';
                        }
                        var html =
                            '<div class="aiz-file-box-wrap" aria-hidden="' +
                            data[i].aria_hidden +
                            '" data-selected="' +
                            data[i].selected +
                            '">' +
                            '<div class="aiz-file-box">' +
                            // '<div class="dropdown-file">' +
                            // '<a class="dropdown-link" data-toggle="dropdown">' +
                            // '<i class="la la-ellipsis-v"></i>' +
                            // "</a>" +
                            // '<div class="dropdown-menu dropdown-menu-right">' +
                            // '<a href="' +
                            // AIZ.data.fileBaseUrl +
                            // data[i].file_name +
                            // '" target="_blank" download="' +
                            // data[i].file_original_name +
                            // "." +
                            // data[i].extension +
                            // '" class="dropdown-item"><i class="la la-download mr-2"></i>Download</a>' +
                            // '<a href="#" class="dropdown-item aiz-uploader-delete" data-id="' +
                            // data[i].id +
                            // '"><i class="la la-trash mr-2"></i>Delete</a>' +
                            // "</div>" +
                            // "</div>" +
                            '<div class="card card-file aiz-uploader-select" title="' +
                            data[i].file_original_name +
                            "." +
                            data[i].extension +
                            '" data-value="' +
                            data[i].id +
                            '">' +
                            '<div class="card-file-thumb">' +
                            thumb +
                            "</div>" +
                            '<div class="card-body">' +
                            '<h6 class="d-flex">' +
                            '<span class="text-truncate title">' +
                            data[i].file_original_name +
                            "</span>" +
                            '<span class="ext flex-shrink-0">.' +
                            data[i].extension +
                            "</span>" +
                            "</h6>" +
                            "<p>" +
                            AIZ.extra.bytesToSize(data[i].file_size) +
                            "</p>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>";

                        $(".aiz-uploader-all").append(html);
                    }
                } else {
                    $(".aiz-uploader-all").html(
                        '<div class="align-items-center d-flex h-100 justify-content-center w-100 nav-tabs"><div class="text-center"><h3>No files found</h3></div></div>'
                    );
                }
                AIZ.uploader.uploadSelect();
                AIZ.uploader.deleteUploaderFile();
            }, 300);
        },
        inputSelectPreviewGenerate: function (elem) {
            elem.find(".selected-files").val(AIZ.uploader.data.selectedFiles);
            elem.next(".file-preview").html(null);

            if (AIZ.uploader.data.selectedFiles.length > 0) {

                $.post(
                    AIZ.data.appUrl + "/aiz-uploader/get_file_by_ids",
                    { _token: AIZ.data.csrf, ids: AIZ.uploader.data.selectedFiles.toString() },
                    function (data) {

                        elem.next(".file-preview").html(null);

                        if (data.length > 0) {
                            elem.find(".file-amount").html(
                                AIZ.uploader.updateFileHtml(data)
                            );
                            for (
                                var i = 0;
                                i < data.length;
                                i++
                            ) {
                                var thumb = "";
                                if (data[i].type === "image") {
                                    thumb =
                                        '<img src="' +
                                        data[i].file_name +
                                        '" class="img-fit">';
                                } else {
                                    thumb = '<i class="la la-file-text"></i>';
                                }
                                var html =
                                    '<div class="d-flex justify-content-between align-items-center mt-2 file-preview-item" data-id="' +
                                    data[i].id +
                                    '" title="' +
                                    data[i].file_original_name +
                                    "." +
                                    data[i].extension +
                                    '">' +
                                    '<div class="align-items-center align-self-stretch d-flex justify-content-center thumb">' +
                                    thumb +
                                    "</div>" +
                                    '<div class="col body">' +
                                    '<h6 class="d-flex">' +
                                    '<span class="text-truncate title">' +
                                    data[i].file_original_name +
                                    "</span>" +
                                    '<span class="flex-shrink-0 ext">.' +
                                    data[i].extension +
                                    "</span>" +
                                    "</h6>" +
                                    "<p>" +
                                    AIZ.extra.bytesToSize(
                                        data[i].file_size
                                    ) +
                                    "</p>" +
                                    "</div>" +
                                    '<div class="remove">' +
                                    '<button class="btn btn-sm btn-link remove-attachment" type="button">' +
                                    '<i class="la la-close"></i>' +
                                    "</button>" +
                                    "</div>" +
                                    "</div>";

                                elem.next(".file-preview").append(html);
                            }
                        } else {
                            elem.find(".file-amount").html(AIZ.local.choose_file);
                        }
                    });
            } else {
                elem.find(".file-amount").html(AIZ.local.choose_file);
            }

            // if (AIZ.uploader.data.selectedFiles.length > 0) {
            //     elem.find(".file-amount").html(
            //         AIZ.uploader.updateFileHtml(AIZ.uploader.data.selectedFiles)
            //     );
            //     for (
            //         var i = 0;
            //         i < AIZ.uploader.data.selectedFiles.length;
            //         i++
            //     ) {
            //         var index = AIZ.uploader.data.allFiles.findIndex(
            //             (x) => x.id === AIZ.uploader.data.selectedFiles[i]
            //         );
            //         var thumb = "";
            //         if (AIZ.uploader.data.allFiles[index].type == "image") {
            //             thumb =
            //                 '<img src="' +
            //                 AIZ.data.appUrl +
            //                 "/public/" +
            //                 AIZ.uploader.data.allFiles[index].file_name +
            //                 '" class="img-fit">';
            //         } else {
            //             thumb = '<i class="la la-file-text"></i>';
            //         }
            //         var html =
            //             '<div class="d-flex justify-content-between align-items-center mt-2 file-preview-item" data-id="' +
            //             AIZ.uploader.data.allFiles[index].id +
            //             '" title="' +
            //             AIZ.uploader.data.allFiles[index].file_original_name +
            //             "." +
            //             AIZ.uploader.data.allFiles[index].extension +
            //             '">' +
            //             '<div class="align-items-center align-self-stretch d-flex justify-content-center thumb">' +
            //             thumb +
            //             "</div>" +
            //             '<div class="col body">' +
            //             '<h6 class="d-flex">' +
            //             '<span class="text-truncate title">' +
            //             AIZ.uploader.data.allFiles[index].file_original_name +
            //             "</span>" +
            //             '<span class="ext">.' +
            //             AIZ.uploader.data.allFiles[index].extension +
            //             "</span>" +
            //             "</h6>" +
            //             "<p>" +
            //             AIZ.extra.bytesToSize(
            //                 AIZ.uploader.data.allFiles[index].file_size
            //             ) +
            //             "</p>" +
            //             "</div>" +
            //             '<div class="remove">' +
            //             '<button class="btn btn-sm btn-link remove-attachment" type="button">' +
            //             '<i class="la la-close"></i>' +
            //             "</button>" +
            //             "</div>" +
            //             "</div>";

            //         elem.next(".file-preview").append(html);
            //     }
            // } else {
            //     elem.find(".file-amount").html("Choose File");
            // }
        },
        editorImageGenerate: function (elem) {
            if (AIZ.uploader.data.selectedFiles.length > 0) {
                for (
                    var i = 0;
                    i < AIZ.uploader.data.selectedFiles.length;
                    i++
                ) {
                    var index = AIZ.uploader.data.allFiles.findIndex(
                        (x) => x.id === AIZ.uploader.data.selectedFiles[i]
                    );
                    var thumb = "";
                    if (AIZ.uploader.data.allFiles[index].type === "image") {
                        thumb =
                            '<img src="' +
                            AIZ.data.fileBaseUrl +
                            AIZ.uploader.data.allFiles[index].file_name +
                            '">';
                        elem[0].insertHTML(thumb);
                        // console.log(elem);
                    }
                }
            }
        },
        dismissUploader: function () {
            $("#aizUploaderModal").on("hidden.bs.modal", function () {
                $(".aiz-uploader-backdrop").remove();
                $("#aizUploaderModal").remove();
            });
        },
        trigger: function (
            elem = null,
            from = "",
            type = "all",
            selectd = "",
            multiple = false,
            callback = null
        ) {
            // $("body").append('<div class="aiz-uploader-backdrop"></div>');

            var elem = $(elem);
            var multiple = multiple;
            var type = type;
            var oldSelectedFiles = selectd;
            if (oldSelectedFiles !== "") {
                AIZ.uploader.data.selectedFiles = oldSelectedFiles
                    .split(",")
                    .map(Number);
            } else {
                AIZ.uploader.data.selectedFiles = [];
            }
            if ("undefined" !== typeof type && type.length > 0) {
                AIZ.uploader.data.type = type;
            }

            if (multiple) {
                AIZ.uploader.data.multiple = true;
            } else {
                AIZ.uploader.data.multiple = false;
            }

            // setTimeout(function() {
            $.post(
                AIZ.data.appUrl + "/aiz-uploader/aiz-uploader-modal",
                { _token: AIZ.data.csrf },
                function (data) {
                    $("body").append(data);
                    $("#aizUploaderModal").modal("show");
                    AIZ.plugins.aizUppy();
                    AIZ.uploader.getAllUploads(
                        AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files",
                        null,
                        $('[name="aiz-uploader-sort"]').val()
                    );
                    AIZ.uploader.updateUploaderSelected();
                    AIZ.uploader.clearUploaderSelected();
                    AIZ.uploader.sortUploaderFiles();
                    AIZ.uploader.searchUploaderFiles();
                    AIZ.uploader.showSelectedFiles();
                    AIZ.uploader.dismissUploader();

                    $("#uploader_next_btn").on("click", function () {
                        if (AIZ.uploader.data.next_page_url != null) {
                            $('[name="aiz-show-selected"]').prop(
                                "checked",
                                false
                            );
                            AIZ.uploader.getAllUploads(
                                AIZ.uploader.data.next_page_url
                            );
                        }
                    });

                    $("#uploader_prev_btn").on("click", function () {
                        if (AIZ.uploader.data.prev_page_url != null) {
                            $('[name="aiz-show-selected"]').prop(
                                "checked",
                                false
                            );
                            AIZ.uploader.getAllUploads(
                                AIZ.uploader.data.prev_page_url
                            );
                        }
                    });

                    $(".aiz-uploader-search i").on("click", function () {
                        $(this).parent().toggleClass("open");
                    });

                    $('[data-toggle="aizUploaderAddSelected"]').on(
                        "click",
                        function () {
                            if (from === "input") {
                                AIZ.uploader.inputSelectPreviewGenerate(elem);
                            } else if (from === "direct") {
                                callback(AIZ.uploader.data.selectedFiles);
                            }
                            $("#aizUploaderModal").modal("hide");
                        }
                    );
                }
            );
            // }, 50);
        },
        initForInput: function () {
            $(document).on("click", '[data-toggle="aizuploader"]', function (e) {
                if (e.detail === 1) {
                    var elem = $(this);
                    var multiple = elem.data("multiple");
                    var type = elem.data("type");
                    var oldSelectedFiles = elem.find(".selected-files").val();

                    multiple = !multiple ? "" : multiple;
                    type = !type ? "" : type;
                    oldSelectedFiles = !oldSelectedFiles
                        ? ""
                        : oldSelectedFiles;

                    AIZ.uploader.trigger(
                        this,
                        "input",
                        type,
                        oldSelectedFiles,
                        multiple
                    );
                }
            });
        },
        previewGenerate: function () {
            $('[data-toggle="aizuploader"]').each(function () {
                var $this = $(this);
                var files = $this.find(".selected-files").val();
                if (files != "") {
                    $.post(
                        AIZ.data.appUrl + "/aiz-uploader/get_file_by_ids",
                        { _token: AIZ.data.csrf, ids: files },
                        function (data) {
                            $this.next(".file-preview").html(null);

                            if (data.length > 0) {
                                $this.find(".file-amount").html(
                                    AIZ.uploader.updateFileHtml(data)
                                );
                                for (
                                    var i = 0;
                                    i < data.length;
                                    i++
                                ) {
                                    var thumb = "";
                                    if (data[i].type === "image") {
                                        thumb =
                                            '<img src="' +
                                            data[i].file_name +
                                            '" class="img-fit">';
                                    } else {
                                        thumb = '<i class="la la-file-text"></i>';
                                    }
                                    var html =
                                        '<div class="d-flex justify-content-between align-items-center mt-2 file-preview-item" data-id="' +
                                        data[i].id +
                                        '" title="' +
                                        data[i].file_original_name +
                                        "." +
                                        data[i].extension +
                                        '">' +
                                        '<div class="align-items-center align-self-stretch d-flex justify-content-center thumb">' +
                                        thumb +
                                        "</div>" +
                                        '<div class="col body">' +
                                        '<h6 class="d-flex">' +
                                        '<span class="text-truncate title">' +
                                        data[i].file_original_name +
                                        "</span>" +
                                        '<span class="ext flex-shrink-0">.' +
                                        data[i].extension +
                                        "</span>" +
                                        "</h6>" +
                                        "<p>" +
                                        AIZ.extra.bytesToSize(
                                            data[i].file_size
                                        ) +
                                        "</p>" +
                                        "</div>" +
                                        '<div class="remove">' +
                                        '<button class="btn btn-sm btn-link remove-attachment" type="button">' +
                                        '<i class="la la-close"></i>' +
                                        "</button>" +
                                        "</div>" +
                                        "</div>";

                                    $this.next(".file-preview").append(html);
                                }
                            } else {
                                $this.find(".file-amount").html(AIZ.local.choose_file);
                            }
                        });
                }
            });
        }
    };
    AIZ.plugins = {
        textEditor: function () {
            $(".aiz-text-editor").each(function (el) {
                var $this = $(this);
                var buttons = $this.data("buttons");
                var minHeight = $this.data("min-height");
                var placeholder = $this.attr("placeholder");
                var format = $this.data("format");

                buttons = !buttons
                    ? [
                        ["font", ["bold", "underline", "italic", "clear"]],
                        ["para", ["ul", "ol", "paragraph"]],
                        ["style", ["style"]],
                        ["color", ["color"]],
                        ["table", ["table"]],
                        ["insert", ["link", "picture", "video"]],
                        ["view", ["fullscreen", "undo", "redo"]],
                    ]
                    : buttons;
                placeholder = !placeholder ? "" : placeholder;
                minHeight = !minHeight ? 200 : minHeight;
                format = (typeof format == 'undefined') ? false : format;

                $this.summernote({
                    toolbar: buttons,
                    placeholder: placeholder,
                    height: minHeight,
                    callbacks: {
                        onImageUpload: function (data) {
                            data.pop();
                        },
                        onPaste: function (e) {
                            if (format) {
                                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                                e.preventDefault();
                                document.execCommand('insertText', false, bufferText);
                            }
                        }
                    }
                });

                var nativeHtmlBuilderFunc = $this.summernote('module', 'videoDialog').createVideoNode;

                $this.summernote('module', 'videoDialog').createVideoNode = function (url) {
                    var wrap = $('<div class="embed-responsive embed-responsive-16by9"></div>');
                    var html = nativeHtmlBuilderFunc(url);
                    html = $(html).addClass('embed-responsive-item');
                    return wrap.append(html)[0];
                };
            });
        },
        dateRange: function () {
            $(".aiz-date-range").each(function () {
                var $this = $(this);
                var today = moment().startOf("day");
                var value = $this.val();
                var startDate = false;
                var minDate = false;
                var maxDate = false;
                var advncdRange = false;
                var ranges = {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days"),
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [
                        moment().startOf("month"),
                        moment().endOf("month"),
                    ],
                    "Last Month": [
                        moment().subtract(1, "month").startOf("month"),
                        moment().subtract(1, "month").endOf("month"),
                    ],
                };

                var single = $this.data("single");
                var monthYearDrop = $this.data("show-dropdown");
                var format = $this.data("format");
                var separator = $this.data("separator");
                var pastDisable = $this.data("past-disable");
                var futureDisable = $this.data("future-disable");
                var timePicker = $this.data("time-picker");
                var timePickerIncrement = $this.data("time-gap");
                var advncdRange = $this.data("advanced-range");

                single = !single ? false : single;
                monthYearDrop = !monthYearDrop ? false : monthYearDrop;
                format = !format ? "YYYY-MM-DD" : format;
                separator = !separator ? " / " : separator;
                minDate = !pastDisable ? minDate : today;
                maxDate = !futureDisable ? maxDate : today;
                timePicker = !timePicker ? false : timePicker;
                timePickerIncrement = !timePickerIncrement ? 1 : timePickerIncrement;
                ranges = !advncdRange ? "" : ranges;

                $this.daterangepicker({
                    singleDatePicker: single,
                    showDropdowns: monthYearDrop,
                    minDate: minDate,
                    maxDate: maxDate,
                    timePickerIncrement: timePickerIncrement,
                    autoUpdateInput: false,
                    ranges: ranges,
                    locale: {
                        format: format,
                        separator: separator,
                        applyLabel: "Select",
                        cancelLabel: "Clear",
                    },
                });
                if (single) {
                    $this.on("apply.daterangepicker", function (ev, picker) {
                        $this.val(picker.startDate.format(format));
                    });
                } else {
                    $this.on("apply.daterangepicker", function (ev, picker) {
                        $this.val(
                            picker.startDate.format(format) +
                            separator +
                            picker.endDate.format(format)
                        );
                    });
                }

                $this.on("cancel.daterangepicker", function (ev, picker) {
                    $this.val("");
                });
            });
        },
        timePicker: function () {
            $(".aiz-time-picker").each(function () {
                var $this = $(this);

                var minuteStep = $this.data("minute-step");
                var defaultTime = $this.data("default");

                minuteStep = !minuteStep ? 10 : minuteStep;
                defaultTime = !defaultTime ? "00:00" : defaultTime;

                $this.timepicker({
                    template: "dropdown",
                    minuteStep: minuteStep,
                    defaultTime: defaultTime,
                    icons: {
                        up: "las la-angle-up",
                        down: "las la-angle-down",
                    },
                    showInputs: false,
                });
            });
        },
        notify: function (type = "dark", message = "") {
            $.notify(
                {
                    // options
                    message: message,
                },
                {
                    // settings
                    showProgressbar: true,
                    delay: 2500,
                    mouse_over: "pause",
                    placement: {
                        from: "bottom",
                        align: "left",
                    },
                    animate: {
                        enter: "animated fadeInUp",
                        exit: "animated fadeOutDown",
                    },
                    type: type,
                    template:
                        '<div data-notify="container" class="aiz-notify alert alert-{0}" role="alert">' +
                        '<button type="button" aria-hidden="true" data-notify="dismiss" class="close"><i class="las la-times"></i></button>' +
                        '<span data-notify="message">{2}</span>' +
                        '<div class="progress" data-notify="progressbar">' +
                        '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                        "</div>" +
                        "</div>",
                }
            );
        },
        aizUppy: function () {
            if ($("#aiz-upload-files").length > 0) {
                var uppy = Uppy.Core({
                    autoProceed: true,
                });
                uppy.use(Uppy.Dashboard, {
                    target: "#aiz-upload-files",
                    inline: true,
                    showLinkToFileUploadResult: false,
                    showProgressDetails: true,
                    hideCancelButton: true,
                    hidePauseResumeButton: true,
                    hideUploadButton: true,
                    proudlyDisplayPoweredByUppy: false,
                    locale: {
                        strings: {
                            addMoreFiles: AIZ.local.add_more_files,
                            addingMoreFiles: AIZ.local.adding_more_files,
                            dropPaste: AIZ.local.drop_files_here_paste_or + ' %{browse}',
                            browse: AIZ.local.browse,
                            uploadComplete: AIZ.local.upload_complete,
                            uploadPaused: AIZ.local.upload_paused,
                            resumeUpload: AIZ.local.resume_upload,
                            pauseUpload: AIZ.local.pause_upload,
                            retryUpload: AIZ.local.retry_upload,
                            cancelUpload: AIZ.local.cancel_upload,
                            xFilesSelected: {
                                0: '%{smart_count} ' + AIZ.local.file_selected,
                                1: '%{smart_count} ' + AIZ.local.files_selected
                            },
                            uploadingXFiles: {
                                0: AIZ.local.uploading + ' %{smart_count} ' + AIZ.local.file,
                                1: AIZ.local.uploading + ' %{smart_count} ' + AIZ.local.files
                            },
                            processingXFiles: {
                                0: AIZ.local.processing + ' %{smart_count} ' + AIZ.local.file,
                                1: AIZ.local.processing + ' %{smart_count} ' + AIZ.local.files
                            },
                            uploading: AIZ.local.uploading,
                            complete: AIZ.local.complete,
                        }
                    }
                });
                uppy.use(Uppy.XHRUpload, {
                    endpoint: AIZ.data.appUrl + "/aiz-uploader/upload",
                    fieldName: "aiz_file",
                    formData: true,
                    headers: {
                        'X-CSRF-TOKEN': AIZ.data.csrf,
                    },
                });
                uppy.on("upload-success", function () {
                    AIZ.uploader.getAllUploads(
                        AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files"
                    );
                });
            }
        },
        tooltip: function () {
            $('body').tooltip({ selector: '[data-toggle="tooltip"]' }).click(function () {
                $('[data-toggle="tooltip"]').tooltip("hide");
            });
        },
        countDown: function () {
            if ($(".aiz-count-down").length > 0) {
                $(".aiz-count-down").each(function () {

                    var $this = $(this);
                    var date = $this.data("date");
                    // console.log(date)

                    $this.countdown(date).on("update.countdown", function (event) {
                        var $this = $(this).html(
                            event.strftime(
                                "" +
                                '<div class="countdown-item"><span class="countdown-digit">%-D</span></div><span class="countdown-separator">:</span>' +
                                '<div class="countdown-item"><span class="countdown-digit">%H</span></div><span class="countdown-separator">:</span>' +
                                '<div class="countdown-item"><span class="countdown-digit">%M</span></div><span class="countdown-separator">:</span>' +
                                '<div class="countdown-item"><span class="countdown-digit">%S</span></div>'
                            )
                        );
                    });

                });
            }
        }
    };
    AIZ.extra = {
        refreshToken: function () {
            $.get(AIZ.data.appUrl + '/refresh-csrf').done(function (data) {
                AIZ.data.csrf = data;
            });
            // console.log(AIZ.data.csrf);
        },
        deleteConfirm: function () {
            $(".confirm-delete").click(function (e) {
                e.preventDefault();
                var url = $(this).data("href");
                $("#delete-modal").modal("show");
                $("#delete-link").attr("href", url);
            });

            $(".confirm-cancel").click(function (e) {
                e.preventDefault();
                var url = $(this).data("href");
                $("#cancel-modal").modal("show");
                $("#cancel-link").attr("href", url);
            });

            $(".confirm-complete").click(function (e) {
                e.preventDefault();
                var url = $(this).data("href");
                $("#complete-modal").modal("show");
                $("#comfirm-link").attr("href", url);
            });

            $(".confirm-alert").click(function (e) {
                e.preventDefault();
                var url = $(this).data("href");
                var target = $(this).data("target");
                $(target).modal("show");
                $(target).find(".comfirm-link").attr("href", url);
                $("#comfirm-link").attr("href", url);
            });
        },
        bytesToSize: function (bytes) {
            var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            if (bytes == 0) return "0 Byte";
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
        },
        multiModal: function () {
            $(document).on("show.bs.modal", ".modal", function (event) {
                var zIndex = 1040 + 10 * $(".modal:visible").length;
                $(this).css("z-index", zIndex);
                setTimeout(function () {
                    $(".modal-backdrop")
                        .not(".modal-stack")
                        .css("z-index", zIndex - 1)
                        .addClass("modal-stack");
                }, 0);
            });
            $(document).on('hidden.bs.modal', function () {
                if ($('.modal.show').length > 0) {
                    $('body').addClass('modal-open');
                }
            });
        },
        bsCustomFile: function () {
            $(".custom-file input").change(function (e) {
                var files = [];
                for (var i = 0; i < $(this)[0].files.length; i++) {
                    files.push($(this)[0].files[i].name);
                }
                if (files.length === 1) {
                    $(this).next(".custom-file-name").html(files[0]);
                } else if (files.length > 1) {
                    $(this)
                        .next(".custom-file-name")
                        .html(files.length + " " + AIZ.local.files_selected);
                } else {
                    $(this).next(".custom-file-name").html(AIZ.local.choose_file);
                }
            });
        },
        stopPropagation: function () {
            $(document).on('click', '.stop-propagation', function (e) {
                e.stopPropagation();
            });
        },
        outsideClickHide: function () {
            $(document).on('click', function (e) {
                $('.document-click-d-none').addClass('d-none');
            });
        },
        scrollToBottom: function () {
            $(".scroll-to-btm").each(function (i, el) {
                el.scrollTop = el.scrollHeight;
            });
        },
        classToggle: function () {
            $(document).on('click', '[data-toggle="class-toggle"]', function () {
                var $this = $(this);
                var target = $this.data("target");
                var sameTriggers = $this.data("same");
                var backdrop = $(this).data("backdrop");

                if ($(target).hasClass("active")) {
                    $(target).removeClass("active");
                    $(sameTriggers).removeClass("active");
                    $this.removeClass("active");
                    $('body').removeClass("overflow-hidden");
                } else {
                    $(target).addClass("active");
                    $this.addClass("active");
                    if (backdrop == 'static') {
                        $('body').addClass("overflow-hidden");
                    }
                }
            });
        },
        addMore: function () {
            $('[data-toggle="add-more"]').each(function () {
                var $this = $(this);
                var content = $this.data("content");
                var target = $this.data("target");

                $this.on("click", function (e) {
                    e.preventDefault();
                    $(target).append(content);
                    AIZ.plugins.bootstrapSelect();
                });
            });
        },
        removeParent: function () {
            $(document).on(
                "click",
                '[data-toggle="remove-parent"]',
                function () {
                    var $this = $(this);
                    var parent = $this.data("parent");
                    $this.closest(parent).remove();
                }
            );
        },
        selectHideShow: function () {
            $('[data-show="selectShow"]').each(function () {
                var target = $(this).data("target");
                $(this).on("change", function () {
                    var value = $(this).val();
                    // console.log(value);
                    $(target)
                        .children()
                        .not("." + value)
                        .addClass("d-none");
                    $(target)
                        .find("." + value)
                        .removeClass("d-none");
                });
            });
        },
        trimAppUrl: function () {
            if (AIZ.data.appUrl.slice(-1) == '/') {
                AIZ.data.appUrl = AIZ.data.appUrl.slice(0, AIZ.data.appUrl.length - 1);
                // console.log(AIZ.data.appUrl);
            }
        },
        setCookie: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },
        getCookie: function (cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        acceptCookie: function () {
            if (!AIZ.extra.getCookie("acceptCookies")) {
                $(".aiz-cookie-alert").addClass("show");
            }
            $(".aiz-cookie-accept").on("click", function () {
                AIZ.extra.setCookie("acceptCookies", true, 60);
                $(".aiz-cookie-alert").removeClass("show");
            });
        },
        setSession: function () {
            $('.set-session').each(function () {
                var $this = $(this);
                var key = $this.data('key');
                var value = $this.data('value');

                const now = new Date();
                const item = {
                    value: value,
                    expiry: now.getTime() + 3600000,
                };

                $this.on('click', function () {
                    localStorage.setItem(key, JSON.stringify(item));
                });
            });
        },
        showSessionPopup: function () {
            $('.removable-session').each(function () {
                var $this = $(this);
                var key = $this.data('key');
                var value = $this.data('value');
                var item = {};
                if (localStorage.getItem(key)) {
                    item = localStorage.getItem(key);
                    item = JSON.parse(item);
                }
                const now = new Date()
                if (typeof item.expiry == 'undefined' || now.getTime() > item.expiry) {
                    $this.removeClass('d-none');
                }
            });
        }
    };

    // setInterval(function () {
    //     AIZ.extra.refreshToken();
    // }, 3600000);

    // init aiz plugins, extra options
    
    AIZ.extra.deleteConfirm();
    // AIZ.extra.multiModal();
    
    // AIZ.extra.bsCustomFile();
    // AIZ.extra.stopPropagation();
    // AIZ.extra.outsideClickHide();
    // AIZ.extra.scrollToBottom();
    // AIZ.extra.classToggle();
    
    // AIZ.extra.autoScroll();
    // AIZ.extra.addMore();
    // AIZ.extra.removeParent();
    
    
    
    // AIZ.extra.trimAppUrl();
    // AIZ.extra.acceptCookie();
    // AIZ.extra.setSession();
    // AIZ.extra.showSessionPopup()

    
    // AIZ.plugins.textEditor();
    
    // AIZ.plugins.countDown();
    // AIZ.plugins.dateRange();
    // AIZ.plugins.timePicker();
    // AIZ.plugins.fooTable();
    
    
    
    

    // initialization of aiz uploader
    AIZ.uploader.initForInput();
    AIZ.uploader.removeAttachment();
    AIZ.uploader.previewGenerate();

    // $(document).ajaxComplete(function(){
    //     AIZ.plugins.bootstrapSelect('refresh');
    // });

})(jQuery);
