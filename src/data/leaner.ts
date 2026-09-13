export type HttpMethod = 'GET' | 'POST' | 'PATCH';

export const API_METHODS: HttpMethod[] = ['GET', 'POST', 'PATCH'];

export interface Endpoint {
  path: string;
  label: string;
  /** Corpo devolvido pelo ambiente de treino para um GET neste endpoint. */
  body: string;
}

export const API_ENDPOINTS: Endpoint[] = [
  {
    path: '/Deals?$top=2',
    label: 'GET /Deals?$top=2',
    body: `{
  "value": [
    {
      "Id": 88421,
      "Title": "Revisão 20.000 km",
      "Amount": 1280.5,
      "StageId": 3,
      "ContactId": 1042
    },
    {
      "Id": 88422,
      "Title": "Troca de pastilhas",
      "Amount": 640,
      "StageId": 1,
      "ContactId": 1088
    }
  ],
  "@odata.count": 2
}`,
  },
  {
    path: '/Contacts/1042',
    label: 'GET /Contacts/1042',
    body: `{
  "Id": 1042,
  "Name": "Auto Center Alecrim",
  "Email": "contato@autoalecrim.com.br",
  "City": "Natal",
  "OwnerId": 17,
  "CreateDate": "2026-03-11T14:02:00Z"
}`,
  },
  {
    path: '/Products',
    label: 'GET /Products',
    body: `{
  "value": [
    { "Id": 501, "Name": "Filtro de óleo 1.0", "Price": 38.9 },
    { "Id": 502, "Name": "Pastilha dianteira", "Price": 189.0 },
    { "Id": 503, "Name": "Amortecedor traseiro", "Price": 412.75 }
  ]
}`,
  },
];

export const API_METHOD_NOT_ALLOWED = `{
  "error": "MethodNotAllowed",
  "message": "Este endpoint de treino aceita apenas GET.",
  "hint": "Troque o método para GET e envie novamente."
}`;

export const API_IDLE_HINT = `// escolha método e endpoint, depois envie
// a resposta formatada aparece aqui`;
