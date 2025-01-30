import { Validation } from 'validation';

export default function customForm() {
  function requiredMessage(field: HTMLInputElement) {
    const label = field.parentElement?.querySelector('label');
    return `${label?.innerText} can't be blank.`;
  }
  const customForm: HTMLFormElement | null = document.querySelector(
    '[data-value="custom"] form'
  );

  if (!customForm) return;

  const customValidation = new Validation(customForm, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    fields: {
      firstName: {
        rules: ['required', 'noSpecialCharacters'],
        messages: {
          required: requiredMessage,
        },
      },
      lastName: {
        rules: ['required', 'noSpecialCharacters'],
        messages: {
          required: requiredMessage,
        },
      },
      email: {
        rules: ['required', 'validEmail'],
        messages: {
          required: requiredMessage,
        },
      },
      phone: {
        rules: ['required', 'numbersOnly'],
        messages: {
          required: requiredMessage,
        },
      },
      shippingAddress1: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        messages: {
          required: requiredMessage,
        },
      },
      shippingAddress2: {
        rules: ['noSpecialCharacters'],
      },
      shippingCity: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        messages: {
          required: requiredMessage,
        },
      },
      shippingState: {
        rules: ['required', 'lettersOnly'],
        messages: {
          required: requiredMessage,
        },
      },
      shippingZipcode: {
        rules: ['required', 'numbersOnly', 'characterAmount(5,9)'],
        messages: {
          required: requiredMessage,
        },
      },
      billingAddress1: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        messages: {
          required: requiredMessage,
        },
      },
      billingAddress2: {
        rules: ['noSpecialCharacters'],
      },
      billingCity: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        messages: {
          required: requiredMessage,
        },
      },
      billingState: {
        rules: ['required', 'lettersOnly'],
        messages: {
          required: requiredMessage,
        },
      },
      billingZipcode: {
        rules: ['required', 'numbersOnly', 'characterAmount(5,9)'],
        messages: {
          required: requiredMessage,
        },
      },
    },
  });

  const sameAsShipping2 = customForm.querySelector(
    '.same-as-shipping-fieldset'
  );
  const sameAsShippingCheckbox2: HTMLInputElement | null =
    customForm.querySelector('.same-as-shipping-checkbox');
  sameAsShippingCheckbox2?.addEventListener('change', (e) => {
    (e.currentTarget as HTMLInputElement).checked
      ? sameAsShipping2?.classList.add('hidden')
      : sameAsShipping2?.classList.remove('hidden');
  });

  customValidation.addMethod(
    'state',
    function (element) {
      const USA_STATES = {
        ALABAMA: 'AL',
        ALASKA: 'AK',
        ARIZONA: 'AZ',
        ARKANSAS: 'AR',
        CALIFORNIA: 'CA',
        COLORADO: 'CO',
        CONNECTICUT: 'CT',
        DELAWARE: 'DE',
        FLORIDA: 'FL',
        GEORGIA: 'GA',
        HAWAII: 'HI',
        IDAHO: 'ID',
        ILLINOIS: 'IL',
        INDIANA: 'IN',
        IOWA: 'IA',
        KANSAS: 'KS',
        KENTUCKY: 'KY',
        LOUISIANA: 'LA',
        MAINE: 'ME',
        MARYLAND: 'MD',
        MASSACHUSETTS: 'MA',
        MICHIGAN: 'MI',
        MINNESOTA: 'MN',
        MISSISSIPPI: 'MS',
        MISSOURI: 'MO',
        MONTANA: 'MT',
        NEBRASKA: 'NE',
        NEVADA: 'NV',
        'NEW HAMPSHIRE': 'NH',
        'NEW JERSEY': 'NJ',
        'NEW MEXICO': 'NM',
        'NEW YORK': 'NY',
        'NORTH CAROLINA': 'NC',
        'NORTH DAKOTA': 'ND',
        OHIO: 'OH',
        OKLAHOMA: 'OK',
        OREGON: 'OR',
        PENNSYLVANIA: 'PA',
        'RHODE ISLAND': 'RI',
        'SOUTH CAROLINA': 'SC',
        'SOUTH DAKOTA': 'SD',
        TENNESSEE: 'TN',
        TEXAS: 'TX',
        UTAH: 'UT',
        VERMONT: 'VT',
        VIRGINIA: 'VA',
        WASHINGTON: 'WA',
        'WEST VIRGINIA': 'WV',
        WISCONSIN: 'WI',
        WYOMING: 'WY',
      };

      const value = element.value.toUpperCase();
      const options = [
        ...Object.values(USA_STATES),
        ...Object.keys(USA_STATES),
      ];
      const licensePlateRegex = new RegExp(`^(${options.join('|')})$`, 'g');
      return licensePlateRegex.test(value);
    },
    'Please enter a valid State'
  );

  customValidation.addMethod(
    'expirationDate',
    function (element) {
      const value = element.value;
      if (value.length !== 5 || !/[01]\/[0-9]/g.test(value)) return false;

      try {
        const month = parseInt(value.slice(0, 2));
        const year = parseInt(value.slice(3, 5));

        return month <= 12 && month >= 1 && year >= 19 && year <= 99;
      } catch (e) {
        return false;
      }
    },
    'Please enter a valid expiration date'
  );

  customValidation.addMethod(
    'cvv',
    function (element) {
      const value = element.value;
      return /[0-9]{3,4}/g.test(value);
    },
    'Please enter a valid expiration date'
  );

  customValidation.addMethod(
    'zipcode',
    function (element) {
      const value = element.value;
      return /[0-9]{5,9}/g.test(value);
    },
    'Please enter a valid zipcode'
  );

  customValidation.addFieldRule('shippingState', 'state');
  customValidation.addFieldRule('billingState', 'state');
  customValidation.addFieldRule('shippingZipcode', 'zipcode');
  customValidation.addFieldRule('billingZipcode', 'zipcode');
  customValidation.setFieldRules('creditCard', ['required', 'numbersOnly']);
  customValidation.setFieldRules('expiration', ['required', 'expirationDate']);
  customValidation.setFieldRules('cvv', ['required', 'numbersOnly', 'cvv']);
}
