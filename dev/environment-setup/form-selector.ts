function saveSelectedForm(value: string) {
  localStorage.setItem('selectedForm', value);
}

function hideActiveSection() {
  const section = document.querySelector('section.active');
  section?.classList.remove('active');
}

function handleSelectChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as string;
  const selectedSection = document.querySelector(
    `section[data-value="${value}"]`
  );

  hideActiveSection();
  selectedSection?.classList.add('active');
  saveSelectedForm(value);
}

function checkStorage() {
  const selectedSection = localStorage.getItem('selectedForm');

  if (!selectedSection) {
    return;
  }

  const section = document.querySelector(`[data-value="${selectedSection}"]`);

  if (section) {
    hideActiveSection();
    section.classList.add('active');
    const select = document.querySelector(
      '.form-selector'
    ) as HTMLSelectElement;
    select.value = selectedSection;
  }
}

export function init() {
  const sections = document.querySelectorAll('section[data-value]');
  const select = document.querySelector('.form-selector');

  sections.forEach((section) => {
    const option = document.createElement('option');
    option.value = (section as HTMLElement).dataset.value!;
    option.innerText = (section as HTMLElement).dataset.label!;
    select?.appendChild(option);
  });

  checkStorage();
  select?.addEventListener('change', handleSelectChange);
}
