import { createProcess } from "../../services/management.service";
import type { ProcessType } from "../../interfaces/process.interface";
import { useManagementActions } from "../../viewmodels/useManagementActions";
import { CustomButton } from "../common/CustomButton";
import { OperationFormModal } from "../common/OperationFormModal";

export function CreateProcessButton({
  onChanged,
}: {
  onChanged: () => Promise<void>;
}) {
  const actions = useManagementActions(onChanged);
  return (
    <>
      <CustomButton
        label="Crear proceso"
        onPress={() =>
          actions.openForm({
            title: "Crear proceso",
            description:
              "El proceso quedará pendiente de inicio y usted será el abogado responsable.",
            fields: [
              {
                key: "caseFileNumber",
                label: "Número de expediente",
                minLength: 2,
              },
              { key: "courtNumber", label: "Juzgado", minLength: 2 },
              {
                key: "type",
                label: "Tipo de juicio",
                type: "select",
                options: [
                  { value: "testate", label: "Testamentario" },
                  { value: "intestate", label: "Intestamentario" },
                  { value: "mixed", label: "Mixto" },
                ],
              },
              {
                key: "name",
                label: "Nombre de la persona fallecida",
                minLength: 2,
              },
              { key: "lastname", label: "Apellidos", minLength: 2 },
              { key: "birthDate", label: "Fecha de nacimiento", type: "date" },
              {
                key: "deathDate",
                label: "Fecha de fallecimiento",
                type: "date",
              },
            ],
            submit: async (values) => {
              await createProcess({
                courtNumber: values.courtNumber,
                caseFileNumber: values.caseFileNumber,
                type: values.type as ProcessType,
                defendant: {
                  name: values.name,
                  lastname: values.lastname,
                  birthDate: values.birthDate,
                  deathDate: values.deathDate,
                },
              });
            },
          })
        }
      />
      <OperationFormModal actions={actions} />
    </>
  );
}
