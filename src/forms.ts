import { M } from "./global";
import $ from "cash-dom";

  const TEXT_BASED_INPUT_SELECTOR = [
    'input:not([type])',
    'input[type=text]',
    'input[type=password]',
    'input[type=email]',
    'input[type=url]',
    'input[type=tel]',
    'input[type=number]',
    'input[type=search]',
    'input[type=date]',
    'input[type=time]',
    'input[type=month]',
    'input[type=datetime-local]',
    'textarea'
  ].join(',');

export class Forms {   
  // Function to update labels of text fields
  static updateTextFields () {
    $(TEXT_BASED_INPUT_SELECTOR).each(function(index, element) {
      let $this = $(this);
      if (
        (element as HTMLInputElement).value.length > 0 ||
        $(element).is(':focus') ||
        element.autofocus ||
        $this.attr('placeholder') !== undefined
      ) {
        $this.siblings('label').addClass('active');
      } else if ((element as HTMLInputElement).validity) {
        $this.siblings('label').toggleClass('active', (element as HTMLInputElement).validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  static validate_field (object) {
    let hasLength = object.attr('data-length') !== undefined;
    let lenAttr = parseInt(object.attr('data-length'));
    let len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }
    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if (
          (object.is(':valid') && hasLength && len <= lenAttr) ||
          (object.is(':valid') && !hasLength)
        ) {
          object.removeClass('invalid');
          object.addClass('valid');
        } else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };

  static textareaAutoResize ($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error('No textarea element found');
      return;
    }

    // Textarea Auto Resize
    let hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    let fontFamily = $textarea.css('font-family');
    let fontSize = $textarea.css('font-size');
    let lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    let paddingTop = $textarea.css('padding-top');
    let paddingRight = $textarea.css('padding-right');
    let paddingBottom = $textarea.css('padding-bottom');
    let paddingLeft = $textarea.css('padding-left');

    if (fontSize) {
      hiddenDiv.css('font-size', fontSize);
    }
    if (fontFamily) {
      hiddenDiv.css('font-family', fontFamily);
    }
    if (lineHeight) {
      hiddenDiv.css('line-height', lineHeight);
    }
    if (paddingTop) {
      hiddenDiv.css('padding-top', paddingTop);
    }
    if (paddingRight) {
      hiddenDiv.css('padding-right', paddingRight);
    }
    if (paddingBottom) {
      hiddenDiv.css('padding-bottom', paddingBottom);
    }
    if (paddingLeft) {
      hiddenDiv.css('padding-left', paddingLeft);
    }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    let content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };

  static Init(){
    $(document).ready(function() {
      // Add active if form auto complete
      $(document).on('change', TEXT_BASED_INPUT_SELECTOR, function() {
        if (this.value.length !== 0 || $(this).attr('placeholder') != undefined) {
          $(this)
            .siblings('label')
            .addClass('active');
        }
        Forms.validate_field($(this));
      });
  
      // Add active if input element has been pre-populated on document ready
      $(document).ready(function() {
        Forms.updateTextFields();
      });
  
      // HTML DOM FORM RESET handling
      $(document).on('reset', function(e) {
        let formReset = $(e.target);
        if (formReset.is('form')) {
          formReset
            .find(TEXT_BASED_INPUT_SELECTOR)
            .removeClass('valid')
            .removeClass('invalid');
          formReset.find(TEXT_BASED_INPUT_SELECTOR).each(function(e) {
            if ((this as HTMLInputElement).value.length) {
              $(this)
                .siblings('label')
                .removeClass('active');
            }
          });
  
          // Reset select (after native reset)
          setTimeout(function() {
            formReset.find('select').each(function() {
              // check if initialized
              if ((this as any).M_FormSelect) {
                $(this).trigger('change');
              }
            });
          }, 0);
        }
      });
  
      /**
       * Add active when element has focus
       * @param {Event} e
       */
      document.addEventListener(
        'focus',
        function(e: any) {
          if ($(e.target).is(TEXT_BASED_INPUT_SELECTOR)) {
            $(e.target)
              .siblings('label, .prefix')
              .addClass('active');
          }
        },
        true
      );
  
      /**
       * Remove active when element is blurred
       * @param {Event} e
       */
      document.addEventListener(
        'blur',
        function(e: any) {
          let $inputElement = $(e.target);
          if ($inputElement.is(TEXT_BASED_INPUT_SELECTOR)) {
            let selector = '.prefix';
  
            if (
              ($inputElement[0] as HTMLInputElement).value.length === 0 &&
              ($inputElement[0] as HTMLInputElement).validity.badInput !== true &&
              $inputElement.attr('placeholder') === undefined
            ) {
              selector += ', label';
            }
            $inputElement.siblings(selector).removeClass('active');
            Forms.validate_field($inputElement);
          }
        },
        true
      );
  
      // Radio and Checkbox focus class
      let radio_checkbox = 'input[type=radio], input[type=checkbox]';
      $(document).on('keyup', radio_checkbox, function(e) {
        // TAB, check if tabbing to radio or checkbox.
        if (e.which === M.keys.TAB) {
          $(this).addClass('tabbed');
          let $this = $(this);
          $this.one('blur', function(e) {
            $(this).removeClass('tabbed');
          });
          return;
        }
      });
  
      let text_area_selector = '.materialize-textarea';
      $(text_area_selector).each(function() {
        let $textarea = $(this);
        /**
         * Resize textarea on document load after storing
         * the original height and the original length
         */
        $textarea.data('original-height', $textarea.height());
        $textarea.data('previous-length', (this as HTMLInputElement).value.length);
        Forms.textareaAutoResize($textarea);
      });
  
      $(document).on('keyup', text_area_selector, function() {
        Forms.textareaAutoResize($(this));
      });
      $(document).on('keydown', text_area_selector, function() {
        Forms.textareaAutoResize($(this));
      });
  
      // File Input Path
      $(document).on('change', '.file-field input[type="file"]', function() {
        let file_field = $(this).closest('.file-field');
        let path_input = file_field.find('input.file-path');
        let files = ($(this)[0] as HTMLInputElement).files;
        let file_names = [];
        for (let i = 0; i < files.length; i++) {
          file_names.push(files[i].name);
        }
        (path_input[0] as HTMLInputElement).value = file_names.join(', ');
        path_input.trigger('change');
      });
    }); // End of $(document).ready
  
  
  }
}

  