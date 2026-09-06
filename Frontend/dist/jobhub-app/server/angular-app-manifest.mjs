
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/company/login"
  },
  {
    "renderMode": 2,
    "route": "/company/register"
  },
  {
    "renderMode": 2,
    "route": "/company/post-job"
  },
  {
    "renderMode": 2,
    "route": "/company/settings"
  },
  {
    "renderMode": 2,
    "route": "/company/applicants"
  },
  {
    "renderMode": 2,
    "route": "/company/profile"
  },
  {
    "renderMode": 2,
    "route": "/company/edit-job"
  },
  {
    "renderMode": 2,
    "route": "/job-seeker/login"
  },
  {
    "renderMode": 2,
    "route": "/job-seeker/register"
  },
  {
    "renderMode": 2,
    "route": "/job-seeker/complete-profile"
  },
  {
    "renderMode": 2,
    "route": "/job-seeker/jobs"
  },
  {
    "renderMode": 2,
    "route": "/job-seeker/saved-jobs"
  },
  {
    "renderMode": 2,
    "route": "/job-seeker/profile"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 9239, hash: 'c42448c36de5fc7360f0b7e29458ed0049d9fe6c188c8a0aaa2d71c4cbd3401b', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1635, hash: 'a6e0c175c2e72ca6b210469107cbdfdb37e4a018db696d72c96dc3e23413de4e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 32311, hash: '0f4caff5279d876cb778b4a2934e4804feba2ab73745f51cc6104f67cc574f22', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'company/register/index.html': {size: 20679, hash: '4aaac6c7b4d09febf3ba2ffe0300ed6347042449cd447aa519631bcf03a9321e', text: () => import('./assets-chunks/company_register_index_html.mjs').then(m => m.default)},
    'company/login/index.html': {size: 18230, hash: 'a9154f98d67d56d86c5715f5be32c6e796323475740accc760c400a7c80f0bad', text: () => import('./assets-chunks/company_login_index_html.mjs').then(m => m.default)},
    'company/post-job/index.html': {size: 25386, hash: '92e4e5caa33a8b646a3fa87d42deee140d18d42e154e1ae52bb7beb8aef4dd4d', text: () => import('./assets-chunks/company_post-job_index_html.mjs').then(m => m.default)},
    'job-seeker/complete-profile/index.html': {size: 20645, hash: '1a62cfb8212d98024e28ff737e96cd6aecfdb46274a2474e43662b8f8c53e193', text: () => import('./assets-chunks/job-seeker_complete-profile_index_html.mjs').then(m => m.default)},
    'job-seeker/login/index.html': {size: 16078, hash: 'fa500cc491988da8a934c966ee34427d19b7cd66bde8acd2457a3c519233be5c', text: () => import('./assets-chunks/job-seeker_login_index_html.mjs').then(m => m.default)},
    'job-seeker/saved-jobs/index.html': {size: 17946, hash: '74a752566270b68ba9a26d6d030eef55adac654da08316e5d3e3871688d47b1e', text: () => import('./assets-chunks/job-seeker_saved-jobs_index_html.mjs').then(m => m.default)},
    'company/profile/index.html': {size: 22001, hash: 'dad2e0bb87d454877bf25ea5ad6db778d7686e073243f5abbee70c105b39b445', text: () => import('./assets-chunks/company_profile_index_html.mjs').then(m => m.default)},
    'job-seeker/register/index.html': {size: 18683, hash: 'dadd9234d223dc001ac0710bde7e2ace43471634bc9b76802d62011d04eacd80', text: () => import('./assets-chunks/job-seeker_register_index_html.mjs').then(m => m.default)},
    'company/settings/index.html': {size: 15682, hash: 'c086b9221ebda297163ecd04ee58ca5e50351422cd5d5d4545901e12b661901d', text: () => import('./assets-chunks/company_settings_index_html.mjs').then(m => m.default)},
    'company/edit-job/index.html': {size: 273, hash: '8d07224d6586bbe5002f94c93d235e8e24d7464773e70c2c731116e0209ee085', text: () => import('./assets-chunks/company_edit-job_index_html.mjs').then(m => m.default)},
    'job-seeker/jobs/index.html': {size: 17948, hash: '0f424107f74a084ae92435ef7a68cc2814e9439361210c2df7593058432cde22', text: () => import('./assets-chunks/job-seeker_jobs_index_html.mjs').then(m => m.default)},
    'company/applicants/index.html': {size: 15189, hash: '2ce69baa5bfa299aaeecd5e563e046cf9b052f327a59c8bc246ca03b9a45dcba', text: () => import('./assets-chunks/company_applicants_index_html.mjs').then(m => m.default)},
    'job-seeker/profile/index.html': {size: 15651, hash: 'c0179c75f9210ae0859897547b35328296de447322818ae96ccd6c22e43883b0', text: () => import('./assets-chunks/job-seeker_profile_index_html.mjs').then(m => m.default)},
    'styles-X5DPXLK3.css': {size: 28019, hash: 'BiXpmWUF654', text: () => import('./assets-chunks/styles-X5DPXLK3_css.mjs').then(m => m.default)}
  },
};
