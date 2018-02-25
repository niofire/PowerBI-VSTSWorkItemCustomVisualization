/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        private rootElement : HTMLElement;
        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            options.element.style.cursor = "default";
            options.element.style.overflowY = 'auto';
            this.target = options.element;
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            this.target.innerHTML="";

            let viewModels = WorkItemViewModelGenerator.generate(options.dataViews[0].categorical);

            viewModels.forEach((viewModel, index)=>{
                this.target.appendChild(Visual.createPanel(viewModel));
            })
        }

        private static createPanel(wit :WorkItemViewModel) : HTMLElement {
            let panel = document.createElement("div");
            panel.className = "panel panel-primary";

            let featureTitle = document.createElement("div");
            featureTitle.className = "panel-heading font-bold cursor-pointer";
            featureTitle.textContent= wit.title;

            panel.appendChild(featureTitle);

            let content = document.createElement("div");
            content.className = "panel-body overflow";
            content.innerHTML = wit.htmlContent;
            panel.appendChild(content);

            return panel;
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }

    export class WorkItemViewModelGenerator {

        public static generate(dataViewCategorical : DataViewCategorical) : WorkItemViewModel[] {
            
            //Assumption is that the first col is the card title, second col is HTMl content
            var output : WorkItemViewModel[] = new Array();

            let titles = dataViewCategorical.categories[0].values;
            let htmlContents = dataViewCategorical.categories[1].values;
            
            for(let i = 0; i < titles.length; ++i){
                if(htmlContents[i] != null){
                    output.push(new WorkItemViewModel(titles[i].toString(),htmlContents[i].toString()));
                }
            }
            return output;
        }
    }

    export class WorkItemViewModel {
        constructor(public title : string, public htmlContent : string){}
    }
}